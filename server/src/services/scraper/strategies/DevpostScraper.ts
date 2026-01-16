import puppeteer from 'puppeteer';
import { ScraperStrategy, ScrapedEventData } from './ScraperStrategy';

export class DevpostScraper implements ScraperStrategy {
  async scrape(): Promise<ScrapedEventData[]> {
    console.log('Starting Devpost scraper strategy...');
    const results: ScrapedEventData[] = [];
    
    // Launch browser for this strategy
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Infinite Scroll loop
    const SCROLL_COUNT = 5; // How many times to scroll down
    const SCROLL_DELAY = 2000; // Wait for content to load

    try {
        console.log('Navigating to Devpost...');
        await page.goto('https://devpost.com/hackathons?challenge_type[]=in-person&challenge_type[]=online', {
            waitUntil: 'networkidle2', // Wait for more stability
            timeout: 60000,
        });

        // Scroll multiple times to load content
        for (let i = 0; i < SCROLL_COUNT; i++) {
            console.log(`Scrolling down (${i + 1}/${SCROLL_COUNT})...`);
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight * 2);
            });
            await new Promise(r => setTimeout(r, SCROLL_DELAY));
        }

        // Extract all visible items
        const allEvents = await page.evaluate(() => {
            const items = document.querySelectorAll('.hackathon-tile');
            const scraped: any[] = [];

            items.forEach((item) => {
                const titleEl = item.querySelector('h3');
                const linkEl = item.querySelector('a.tile-anchor');
                const imgEl = item.querySelector('img');
                
                const organizerEl = item.querySelector('.host-label');
                const locationEl = item.querySelector('.info-with-icon .fa-map-marker-alt + .info') || 
                                item.querySelector('.info span') ||
                                item.querySelector('.info-with-icon .fa-globe + .info');

                const prizeEl = item.querySelector('.prize-amount') || item.querySelector('.prize');
                const participantsEl = item.querySelector('.participants strong') || 
                                    item.querySelector('.participants');
                
                const deadlineEl = item.querySelector('.info-with-icon .fa-calendar + .info') || 
                                item.querySelector('.info-with-icon .fa-calendar-alt + .info') ||
                                item.querySelector('.submission-period');
                
                let parsedDate = new Date();
                if (deadlineEl) {
                    const dateText = deadlineEl.textContent?.trim() || "";
                    const parts = dateText.split(' - ');
                    const endDateStr = parts.length > 1 ? parts[1] : parts[0];
                    if (endDateStr) {
                        const d = new Date(endDateStr);
                        if (!isNaN(d.getTime())) parsedDate = d;
                    }
                }

                if (titleEl && linkEl) {
                    const url = (linkEl as HTMLAnchorElement).href;
                    scraped.push({
                        title: titleEl.textContent?.trim() || 'Untitled',
                        url: url,
                        source: 'Devpost',
                        imageUrl: imgEl ? imgEl.src : '',
                        description: deadlineEl ? `Deadline: ${deadlineEl.textContent?.trim()}` : 'Imported from Devpost',
                        organizer: organizerEl ? organizerEl.textContent?.trim() : 'Unknown',
                        location: locationEl ? locationEl.textContent?.trim() : (item.textContent?.includes('Online') ? 'Online' : 'Unknown'),
                        prize: prizeEl ? prizeEl.textContent?.trim() : undefined,
                        participants: participantsEl ? participantsEl.textContent?.trim() : undefined,
                        startDate: parsedDate.toISOString(),
                    });
                }
            });
            return scraped;
        });

        // Deserialize dates & Add to results
        const processedData = allEvents.map((item: any) => ({
            ...item,
            startDate: new Date(item.startDate),
        }));

        results.push(...processedData);
        console.log(`Extracted total of ${processedData.length} events from Devpost.`);

    } catch (err) {
        console.error(`Error during Devpost infinite scroll:`, err);
    }

    } catch (error) {
      console.error('Devpost Scraper Error:', error);
    } finally {
      await browser.close();
    }

    return results;
  }
}
