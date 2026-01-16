import puppeteer, { Browser, Page } from 'puppeteer';
import db from '../../db'; // Adjust path to db instance
import { scrapedEventsTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { ScrapedEventData } from './strategies/ScraperStrategy';
import { DevpostScraper } from './strategies/DevpostScraper';
import { MlhScraper } from './strategies/MlhScraper';

export class ScraperService {
  async scrapeAll() {
    console.log('Starting scrape job...');
    const events: ScrapedEventData[] = [];

    // Define strategies
    const strategies = [
        new DevpostScraper(),
        new MlhScraper(),
    ];

    try {
        for (const strategy of strategies) {
            const strategyEvents = await strategy.scrape();
            events.push(...strategyEvents);
        }

      // 3. Save to DB
      await this.saveEvents(events);

    } catch (error) {
      console.error('Error during scraping:', error);
    }
    console.log(`Scrape job finished. Processed ${events.length} events.`);
  }

  private async saveEvents(events: ScrapedEventData[]) {
    for (const event of events) {
      // Check if exists by URL
      const existing = await db.select().from(scrapedEventsTable).where(eq(scrapedEventsTable.url, event.url));
      
      const eventData = {
          title: event.title,
          description: event.description,
          url: event.url,
          source: event.source,
          // Fix: check for organizer type safety
          organizer: (event as any).organizer,
          location: (event as any).location,
          prize: (event as any).prize,
          participants: (event as any).participants,
          imageUrl: event.imageUrl,
          startDate: (!event.startDate || isNaN(event.startDate.getTime())) ? new Date() : event.startDate,
          scrapedAt: new Date(),
      };

      if (!event.startDate || isNaN(event.startDate.getTime())) {
          console.warn(`Invalid date detected for event: ${event.title}. Falling back to now.`);
      }

      if (existing.length === 0) {
        await db.insert(scrapedEventsTable).values(eventData);
        console.log(`Inserted: ${event.title}`);
      } else {
        // Update existing record with refined data
        await db.update(scrapedEventsTable)
                .set(eventData)
                .where(eq(scrapedEventsTable.url, event.url));
        console.log(`Updated: ${event.title}`);
      }
    }
  }
}
