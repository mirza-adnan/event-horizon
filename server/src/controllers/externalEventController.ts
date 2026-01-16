import { Request, Response } from 'express';
import db from '../db';
import { scrapedEventsTable } from '../db/schema';
import { ScraperService } from '../services/scraper/ScraperService';
import { desc } from 'drizzle-orm';

export const getExternalEvents = async (req: Request, res: Response) => {
    try {
        const events = await db.select().from(scrapedEventsTable).orderBy(desc(scrapedEventsTable.scrapedAt));
        res.json(events);
    } catch (error) {
        console.error('Error fetching external events:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const triggerScraper = async (req: Request, res: Response) => {
    try {
        // [Scraper Feature] Manual trigger
        const scraper = new ScraperService();
        await scraper.scrapeAll();
        res.json({ message: 'Scraping completed successfully' });
    } catch (error) {
        console.error('Error triggering scraper:', error);
        res.status(500).json({ message: 'Scraping failed' });
    }
};
