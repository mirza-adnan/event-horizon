import puppeteer from 'puppeteer';
import { ScraperStrategy, ScrapedEventData } from './ScraperStrategy';

export class MlhScraper implements ScraperStrategy {
  async scrape(): Promise<ScrapedEventData[]> {
    console.log('Starting MLH scraper strategy...');
    const results: ScrapedEventData[] = [];
    
    // Launch browser for this strategy
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      console.log('Navigating to MLH...');
      // Targeted for 2026 season
      await page.goto('https://mlh.io/seasons/2026/events', {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      // Wait for event cards
      try {
          await page.waitForSelector('a.block', { timeout: 15000 });
      } catch (e) {
          console.warn('Timeout waiting for MLH event cards.');
      }

      // Extract data
      const data = await page.evaluate(() => {
        const items = document.querySelectorAll('a.block');
        const scraped: any[] = [];

        items.forEach((item) => {
          const titleEl = item.querySelector('h3');
          const url = (item as HTMLAnchorElement).href;
          
          // Selectors
          const paragraphs = item.querySelectorAll('p');
          const dateText = paragraphs[0]?.textContent?.trim();
          const locationText = paragraphs[1]?.textContent?.trim(); // e.g. "Online" or "City, State"
          
          // Logic to find image: The first one is often background, second is logo
          // MLH structure: div.relative > img (background) + div.absolute > img (logo)
          // Let's try to query the logo specifically
          const logoImg = item.querySelector('div.relative div img') as HTMLImageElement;
          const imageUrl = logoImg ? logoImg.src : (item.querySelector('img') as HTMLImageElement)?.src;

          if (titleEl && url) {
             scraped.push({
                 title: titleEl.textContent?.trim() || 'Untitled',
                 url: url,
                 source: 'MLH',
                 imageUrl: imageUrl || '',
                 description: dateText ? `Date: ${dateText} - ${locationText}` : 'Imported from MLH',
                 organizer: 'MLH',
                 location: locationText || 'Unknown',
                 prize: undefined, // MLH list doesn't show prize on card
                 participants: undefined,
                 dateStr: dateText, // Pass raw date to be parsed in Node context
             });
          }
        });
        return scraped;
      });

      console.log(`Extracted ${data.length} MLH events.`);
      
      // Post-processing: Date Parsing
      const seasonYear = 2026; // Target season
      const processedData = data.map((item: any) => {
          let startDate = new Date();
          if (item.dateStr) {
              // Format: "JAN 09 - 15" or "MAY 01 - 03"
              const parts = item.dateStr.split(' - ');
              if (parts.length > 0) {
                  const startPart = parts[0].trim(); // "JAN 09"
                  const monthStr = startPart.split(' ')[0]; // "JAN"
                  
                  // MLH Seasons (e.g. 2026) start in late 2025 and end in 2026.
                  // Months SEP, OCT, NOV, DEC are in (seasonYear - 1)
                  // Months JAN-AUG are in seasonYear
                  const lateMonths = ['SEP', 'OCT', 'NOV', 'DEC'];
                  const year = lateMonths.includes(monthStr.toUpperCase()) ? seasonYear - 1 : seasonYear;
                  
                  const d = new Date(`${startPart}, ${year}`);
                  if (!isNaN(d.getTime())) {
                       startDate = d;
                  }
              }
          }

          return {
              title: item.title,
              description: item.description,
              url: item.url,
              source: item.source,
              imageUrl: item.imageUrl,
              organizer: item.organizer,
              location: item.location,
              startDate: startDate
          };
      });

      results.push(...processedData);

    } catch (error) {
      console.error('MLH Scraper Error:', error);
    } finally {
      await browser.close();
    }

    return results;
  }
}
