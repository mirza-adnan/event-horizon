import { Request, Response } from "express";
import { eq, and, desc } from "drizzle-orm";
import db from "../db";
import { eventsTable, orgsTable } from "../db/schema";
import fs from "fs";

// Create a new event
export async function createEvent(req: Request, res: Response) {
    try {
        const orgId = (req as any).orgId;

        // Verify organizer exists and is verified
        const [organizer] = await db
            .select()
            .from(orgsTable)
            .where(eq(orgsTable.id, orgId));

        if (!organizer) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: "Organizer not found" });
        }

        if (organizer.status !== "verified") {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(403).json({
                error: "Only verified organizers can create events",
            });
        }

        const {
            title,
            description,
            category,
            venue,
            address,
            city,
            country,
            startDate,
            endDate,
            ticketPrice,
            maxAttendees,
            status,
        } = req.body;

        if (!title || !venue || !address || !city || !country || !startDate || !endDate) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({
                error: "End date must be after start date",
            });
        }

        if (start < new Date()) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({
                error: "Start date cannot be in the past",
            });
        }

        const coverImageUrl = req.file
            ? `/uploads/events/${req.file.filename}`
            : null;

        const [newEvent] = await db
            .insert(eventsTable)
            .values({
                organizerId: orgId,
                title,
                description,
                category: category || "other",
                venue,
                address,
                city,
                country,
                startDate: start,
                endDate: end,
                coverImageUrl,
                ticketPrice: ticketPrice ? ticketPrice.toString() : null,
                maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
                status: status || "draft",
            })
            .returning();

        res.status(201).json({
            message: "Event created successfully",
            event: newEvent,
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Error creating event" });
    }
}

// Get all events (public)
export async function getAllEvents(req: Request, res: Response) {
    try {
        const events = await db
            .select({
                id: eventsTable.id,
                title: eventsTable.title,
                description: eventsTable.description,
                category: eventsTable.category,
                venue: eventsTable.venue,
                address: eventsTable.address,
                city: eventsTable.city,
                country: eventsTable.country,
                startDate: eventsTable.startDate,
                endDate: eventsTable.endDate,
                coverImageUrl: eventsTable.coverImageUrl,
                ticketPrice: eventsTable.ticketPrice,
                maxAttendees: eventsTable.maxAttendees,
                status: eventsTable.status,
                createdAt: eventsTable.createdAt,
                organizer: {
                    id: orgsTable.id,
                    name: orgsTable.name,
                },
            })
            .from(eventsTable)
            .innerJoin(orgsTable, eq(eventsTable.organizerId, orgsTable.id))
            .where(eq(eventsTable.status, "published"))
            .orderBy(desc(eventsTable.startDate));

        res.json({ events });
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Error fetching events" });
    }
}

// Get single event by ID (public)
export async function getEventById(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const [event] = await db
            .select({
                id: eventsTable.id,
                title: eventsTable.title,
                description: eventsTable.description,
                category: eventsTable.category,
                venue: eventsTable.venue,
                address: eventsTable.address,
                city: eventsTable.city,
                country: eventsTable.country,
                startDate: eventsTable.startDate,
                endDate: eventsTable.endDate,
                coverImageUrl: eventsTable.coverImageUrl,
                ticketPrice: eventsTable.ticketPrice,
                maxAttendees: eventsTable.maxAttendees,
                status: eventsTable.status,
                createdAt: eventsTable.createdAt,
                organizer: {
                    id: orgsTable.id,
                    name: orgsTable.name,
                    email: orgsTable.email,
                    phone: orgsTable.phone,
                    website: orgsTable.website,
                },
            })
            .from(eventsTable)
            .innerJoin(orgsTable, eq(eventsTable.organizerId, orgsTable.id))
            .where(eq(eventsTable.id, id));

        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.json({ event });
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({ error: "Error fetching event" });
    }
}

// Get organizer's events
export async function getOrganizerEvents(req: Request, res: Response) {
    try {
        const orgId = (req as any).orgId;

        const events = await db
            .select()
            .from(eventsTable)
            .where(eq(eventsTable.organizerId, orgId))
            .orderBy(desc(eventsTable.createdAt));

        res.json({ events });
    } catch (error) {
        console.error("Error fetching organizer events:", error);
        res.status(500).json({ error: "Error fetching events" });
    }
}

// Update event
export async function updateEvent(req: Request, res: Response) {
    try {
        const orgId = (req as any).orgId;
        const { id } = req.params;

        // Check if event exists and belongs to organizer
        const [existingEvent] = await db
            .select()
            .from(eventsTable)
            .where(and(eq(eventsTable.id, id), eq(eventsTable.organizerId, orgId)));

        if (!existingEvent) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: "Event not found" });
        }

        const {
            title,
            description,
            category,
            venue,
            address,
            city,
            country,
            startDate,
            endDate,
            ticketPrice,
            maxAttendees,
            status,
        } = req.body;

        const updateData: any = { updatedAt: new Date() };

        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (category) updateData.category = category;
        if (venue) updateData.venue = venue;
        if (address) updateData.address = address;
        if (city) updateData.city = city;
        if (country) updateData.country = country;
        if (startDate) updateData.startDate = new Date(startDate);
        if (endDate) updateData.endDate = new Date(endDate);
        if (ticketPrice !== undefined) updateData.ticketPrice = ticketPrice?.toString();
        if (maxAttendees !== undefined) updateData.maxAttendees = maxAttendees ? parseInt(maxAttendees) : null;
        if (status) updateData.status = status;

        if (req.file) {
            // Delete old image if exists
            if (existingEvent.coverImageUrl) {
                const oldPath = `.${existingEvent.coverImageUrl}`;
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            updateData.coverImageUrl = `/uploads/events/${req.file.filename}`;
        }

        const [updatedEvent] = await db
            .update(eventsTable)
            .set(updateData)
            .where(eq(eventsTable.id, id))
            .returning();

        res.json({
            message: "Event updated successfully",
            event: updatedEvent,
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        console.error("Error updating event:", error);
        res.status(500).json({ error: "Error updating event" });
    }
}

// Delete event
export async function deleteEvent(req: Request, res: Response) {
    try {
        const orgId = (req as any).orgId;
        const { id } = req.params;

        // Check if event exists and belongs to organizer
        const [existingEvent] = await db
            .select()
            .from(eventsTable)
            .where(and(eq(eventsTable.id, id), eq(eventsTable.organizerId, orgId)));

        if (!existingEvent) {
            return res.status(404).json({ error: "Event not found" });
        }

        // Delete cover image if exists
        if (existingEvent.coverImageUrl) {
            const imagePath = `.${existingEvent.coverImageUrl}`;
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await db.delete(eventsTable).where(eq(eventsTable.id, id));

        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: "Error deleting event" });
    }
}
