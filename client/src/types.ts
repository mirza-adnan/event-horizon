export type ButtonProps = {
    variant: "primary" | "secondary" | "tertiary";
    children: React.ReactNode;
};

export type EventCategory =
    | "music"
    | "sports"
    | "arts"
    | "food"
    | "tech"
    | "business"
    | "education"
    | "charity"
    | "other";

export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export type Event = {
    id: string;
    organizerId: string;
    title: string;
    description: string | null;
    category: EventCategory;
    venue: string;
    address: string;
    city: string;
    country: string;
    startDate: string;
    endDate: string;
    coverImageUrl: string | null;
    ticketPrice: string | null;
    maxAttendees: number | null;
    status: EventStatus;
    createdAt: string;
    updatedAt: string;
    organizer?: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
        website?: string;
    };
};

export type CreateEventInput = {
    title: string;
    description?: string;
    category: EventCategory;
    venue: string;
    address: string;
    city: string;
    country: string;
    startDate: string;
    endDate: string;
    ticketPrice?: string;
    maxAttendees?: number;
    status?: EventStatus;
};
