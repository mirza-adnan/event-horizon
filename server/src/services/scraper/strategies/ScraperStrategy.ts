export interface ScrapedEventData {
  title: string;
  description: string;
  url: string;
  source: string;
  imageUrl: string;
  startDate?: Date;
  organizer?: string;
  location?: string;
  prize?: string;
  participants?: string;
}

export interface ScraperStrategy {
  scrape(): Promise<ScrapedEventData[]>;
}
