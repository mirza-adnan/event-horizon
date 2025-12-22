import { Request, Response } from "express";
import db from "../db";
import {
    eventsTable,
    categoriesTable,
    eventCategoriesTable,
    segmentsTable,
} from "../db/schema";
import { eq, and } from "drizzle-orm";

interface CreateEventRequestBody {
    title: string;
    description: string;
    address: string;
    city: string;
    country?: string;
    startDate: string;
    endDate?: string;
    status?: "draft" | "published";
    bannerUrl?: string;
    categoryNames?: string[];
    segments?: Array<{
        name: string;
        description: string;
        startTime: string;
        endTime: string;
        capacity: number;
        categoryId: string;
        isTeamSegment: boolean;
        isOnline: boolean;
        registrationDeadline?: string;
    }>;
}

export const createEvent = async (req: Request, res: Response) => {
    try {
        const {
            title,
            description,
            address,
            city,
            country = "Bangladesh",
            startDate,
            endDate,
            status = "draft",
            bannerUrl,
            categoryNames = [],
            segments = [],
        }: CreateEventRequestBody = req.body;

        if (endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({
                message: "End date must be greater than or equal to start date",
            });
        }

        const organizerId = (req as any).organizer?.id;
        if (!organizerId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (categoryNames.length > 0) {
            const existingCategories = await db
                .select({ name: categoriesTable.name })
                .from(categoriesTable)
                .where(
                    and(
                        ...categoryNames.map((name) =>
                            eq(categoriesTable.name, name)
                        )
                    )
                );

            const existingCategoryNames = existingCategories.map(
                (cat) => cat.name
            );
            const missingCategories = categoryNames.filter(
                (name) => !existingCategoryNames.includes(name)
            );

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
                    bannerUrl,
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
