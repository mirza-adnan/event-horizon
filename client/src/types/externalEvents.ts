export interface ScrapedEvent {
    id: string;
    title: string;
    description?: string;
    organizer?: string;
    location?: string;
    prize?: string;
    participants?: string;
    url: string;
    source: string;
    imageUrl: string | null;
    startDate: string | null;
    scrapedAt: string;
}
