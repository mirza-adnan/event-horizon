import { Request, Response } from "express";
import db from "../db";
import {
    eventsTable,
    categoriesTable,
    eventCategoriesTable,
    segmentsTable,
} from "../db/schema";
import { eq, and, or } from "drizzle-orm";

export const createEvent = async (req: Request, res: Response) => {
    try {
        // Extract fields from the request body
        const {
            title,
            description,
            address,
            city,
            country = "Bangladesh",
            startDate,
            endDate,
            status = "draft",
        } = req.body;

        // Handle categoryNames - it can come as a string, array, or multiple fields
        let categoryNames: string[] = [];
        if (req.body.categoryNames) {
            if (Array.isArray(req.body.categoryNames)) {
                categoryNames = req.body.categoryNames;
            } else if (typeof req.body.categoryNames === "string") {
                categoryNames = [req.body.categoryNames];
            }
        }

        // Handle segments - it can come as a string or array
        let segments: Array<{
            name: string;
            description: string;
            startTime: string;
            endTime: string;
            capacity: number;
            categoryId: string;
            isTeamSegment: boolean;
            isOnline: boolean;
            registrationDeadline?: string;
            minTeamSize?: number;
            maxTeamSize?: number;
        }> = [];
        if (req.body.segments) {
            if (typeof req.body.segments === "string") {
                try {
                    segments = JSON.parse(req.body.segments);
                } catch (parseError) {
                    // If it's not JSON, it might be an array of objects already
                    segments = req.body.segments;
                }
            } else if (Array.isArray(req.body.segments)) {
                segments = req.body.segments;
            }
        }

        if (endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({
                message: "End date must be greater than or equal to start date",
            });
        }

        const organizerId = (req as any).organizer?.id;
        if (!organizerId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Handle banner file upload if present
        let bannerUrl: string | undefined;
        if (req.file) {
            // Convert absolute path to relative path
            bannerUrl = req.file.path
                .replace(process.cwd(), "")
                .replace(/\\/g, "/");
        }

        if (categoryNames.length > 0) {
            const existingCategories = await db
                .select({ name: categoriesTable.name })
                .from(categoriesTable)
                .where(
                    or(
                        ...categoryNames.map((name) => {
                            console.log("name", name);
                            return eq(categoriesTable.name, name);
                        })
                    )
                );

            const existingCategoryNames = existingCategories.map(
                (cat) => cat.name
            );
            const missingCategories = categoryNames.filter(
                (name) => !existingCategoryNames.includes(name)
            );

            console.log(existingCategories);
            console.log(existingCategoryNames);

            if (missingCategories.length > 0) {
                return res.status(400).json({
                    message: `Categories do not exist: ${missingCategories.join(
                        ", "
                    )}`,
                });
            }
        }

        // Validate segments if provided
        if (segments.length > 0) {
            for (const segment of segments) {
                if (
                    segment.endTime &&
                    new Date(segment.endTime) < new Date(segment.startTime)
                ) {
                    return res.status(400).json({
                        message:
                            "Segment end time must be greater than or equal to start time",
                    });
                }

                if (segment.categoryId) {
                    // Check if category exists
                    const [category] = await db
                        .select({ name: categoriesTable.name })
                        .from(categoriesTable)
                        .where(eq(categoriesTable.name, segment.categoryId));

                    if (!category) {
                        return res.status(400).json({
                            message: `Category does not exist: ${segment.categoryId}`,
                        });
                    }
                }

                // Validate team size fields if isTeamSegment is true
                if (segment.isTeamSegment) {
                    if (
                        segment.minTeamSize === undefined ||
                        segment.minTeamSize < 1
                    ) {
                        return res.status(400).json({
                            message:
                                "Min team size must be at least 1 for team segments",
                        });
                    }

                    if (
                        segment.maxTeamSize === undefined ||
                        segment.maxTeamSize < 1
                    ) {
                        return res.status(400).json({
                            message:
                                "Max team size must be at least 1 for team segments",
                        });
                    }

                    if (segment.minTeamSize > segment.maxTeamSize) {
                        return res.status(400).json({
                            message:
                                "Min team size cannot be greater than max team size",
                        });
                    }
                }
            }
        }

        const result = await db.transaction(async (tx) => {
            const [newEvent] = await tx
                .insert(eventsTable)
                .values({
                    title,
                    description,
                    address,
                    city,
                    country,
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : null,
                    status,
                    bannerUrl, // Use the relative path
                    organizerId,
                })
                .returning();

            if (categoryNames.length > 0) {
                const eventCategoryValues = categoryNames.map(
                    (categoryName) => ({
                        eventId: newEvent.id,
                        categoryName,
                    })
                );

                await tx
                    .insert(eventCategoriesTable)
                    .values(eventCategoryValues);
            }

            // Create segments if provided
            if (segments.length > 0) {
                console.log("here1");
                const segmentValues = segments.map((segment) => ({
                    name: segment.name,
                    description: segment.description,
                    startTime: new Date(segment.startTime),
                    endTime: new Date(segment.endTime),
                    capacity: segment.capacity,
                    isTeamSegment: segment.isTeamSegment,
                    isOnline: segment.isOnline,
                    registrationDeadline: segment.registrationDeadline
                        ? new Date(segment.registrationDeadline)
                        : null,
                    minTeamSize: segment.minTeamSize || null,
                    maxTeamSize: segment.maxTeamSize || null,
                    eventId: newEvent.id,
                    categoryId: segment.categoryId || null,
                }));

                await tx.insert(segmentsTable).values(segmentValues);
                console.log("here2");
            }

            return newEvent;
        });

        res.status(201).json({
            message: "Event created.",
            event: result,
        });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
};
