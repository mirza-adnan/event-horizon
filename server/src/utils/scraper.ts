import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const COOKIES_PATH = path.resolve(__dirname, "../../facebook_cookies.json");

export async function scrapeFacebookEvents() {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized", "--disable-notifications"],
        });
        const page = await browser.newPage();

        // Emulate a normal user agent to reduce bot detection
        await page.setUserAgent({
            userAgent: "Mozilla/5.0 (compatible; EventBot/1.0)",
        });

        // Check for cookies
        if (fs.existsSync(COOKIES_PATH)) {
            console.log("Loading cookies from file...");
            const cookiesString = fs.readFileSync(COOKIES_PATH, 'utf8');
            const cookies = JSON.parse(cookiesString);
            await browser.setCookie(...cookies);
            console.log("Cookies loaded.");
        } else {
            console.log("No cookies file found. Proceeding as guest.");
        }

        // Direct navigation to Events page
        console.log("Navigating to Events page...");
        await page.goto("https://www.facebook.com/events", {
            waitUntil: "networkidle2",
        });

        // Wait specifically for the login popup or fields to settle
        // try {
        //     await page.waitForSelector('input[name="email"]', {
        //         timeout: 10000,
        //     });
        // } catch (e) {
        //     console.log(
        //         "Login inputs not found immediately. Checking frames or manual interaction might be needed."
        //     );
        // }

        // console.log("Logging in via popup...");
        // await page.type('input[name="email"]', "l.v.reisender@gmail.com", {
        //     delay: 100,
        // });
        // await page.type('input[name="pass"]', "Lv172022", {
        //     delay: 100,
        // });

        // await page.keyboard.press("Enter");

        // console.log("Login submitted. Waiting for load...");
        // await page.waitForNavigation({
        //     waitUntil: "networkidle2",
        //     timeout: 60000,
        // });

        if (!page.url().includes("events")) {
            console.log(
                "Redirected to non-events page. Navigating back to events..."
            );
            await page.goto("https://www.facebook.com/events", {
                waitUntil: "networkidle2",
            });
        }

        // Wait for connection/feed load
        await new Promise((r) => setTimeout(r, 5000));

        // Scroll to load more items
        console.log("Scrolling to load events...");
        for (let i = 0; i < 3; i++) {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await new Promise((r) => setTimeout(r, 2000));
        }

        // Extract Data
        console.log("Extracting event data...");
        const events = await page.evaluate(() => {
            const results: any = [];

            const buttons = Array.from(
                document.querySelectorAll(
                    'div[role="button"], span[role="button"]'
                )
            ).filter((el) => el.innerText === "Interested");

            const processedLinks = new Set();

            buttons.forEach((btn) => {
                let container = btn;
                let foundLink = null;

                for (let i = 0; i < 8; i++) {
                    if (!container.parentElement) break;
                    container = container.parentElement;

                    const link = container.querySelector('a[href*="/events/"]');
                    if (link) {
                        foundLink = link;
                        break;
                    }
                }

                if (foundLink && !processedLinks.has(foundLink.href)) {
                    const cleanHref = foundLink.href.split("?")[0];
                    if (processedLinks.has(cleanHref)) return;
                    processedLinks.add(cleanHref);

                    const lines = container.innerText
                        .split("\n")
                        .map((l) => l.trim())
                        .filter(
                            (l) =>
                                l.length > 0 &&
                                l !== "Interested" &&
                                l !== "Going" &&
                                l !== "Share"
                        );

                    if (lines.length >= 3) {
                        const img = container.querySelector("img");
                        const imgSrc = img ? img.src : "No image found";

                        results.push({
                            title: lines[1],
                            date: lines[0],
                            location: lines[2],
                            link: foundLink.href.replace('web.facebook.com', 'www.facebook.com'),
                            imageUrl: imgSrc,
                        });
                    }
                }
            });
            return results;
        });

        console.log(`Found ${events.length} events.`);
        console.log(events);
        await browser.close();
        return events;
    } catch (error) {
        console.error("Error in scraper:", error);
        if (browser) await browser.close();
        return [];
    }
}

export async function scrapeEventsWithoutLogin() {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized', '--disable-notifications']
        });
        const page = await browser.newPage();
       
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Check for cookies
        if (fs.existsSync(COOKIES_PATH)) {
            console.log("Loading cookies from file...");
            const cookiesString = fs.readFileSync(COOKIES_PATH, 'utf8');
            const cookies = JSON.parse(cookiesString);
            await page.setCookie(...cookies);
            console.log("Cookies loaded.");
        } else {
            console.log("No cookies file found. Proceeding as guest.");
        }

        // Public Search Navigation
        console.log('Navigating to Public Events Search...');
        await page.goto('https://www.facebook.com/events', { waitUntil: 'networkidle2' });

        // Handle Initial Popup (login prompt) if present
        try {
            await page.waitForSelector('div[aria-label="Close"]', { timeout: 5000 });
            console.log('Closing initial popup...');
            await page.click('div[aria-label="Close"]');
        } catch (e) {
            console.log('No initial popup close button found (or timed out).');
        }

        // Setup periodic popup cleaner
        // This function will be evaluated in the page context periodically
        const removeBlockingPopups = () => {
             // 1. "See more on Facebook" popup (fixed center)
             const seeMore = Array.from(document.querySelectorAll('*')).find(el => el.textContent === 'See more on Facebook' && el.children.length === 0);
             if (seeMore) {
                 let curr = seeMore;
                 while (curr && curr.parentElement && curr.parentElement !== document.body) {
                   const style = window.getComputedStyle(curr);
                   if (style.position === 'fixed') {
                       curr.remove(); // Remove the popup container
                       break;
                   }
                   curr = curr.parentElement;
                 }
             }
             
             // 2. Remove dark blocking overlays
             const divs = document.querySelectorAll('div');
             for (const div of divs) {
               const style = window.getComputedStyle(div);
               if (style.position === 'fixed' &&
                   style.backgroundColor.includes('rgba(0, 0, 0') &&
                   (parseInt(style.zIndex) > 0 || style.width === '100vw')) {
                 div.remove();
               }
             }

             // 3. Fix scroll lock
             document.body.style.setProperty('overflow', 'auto', 'important');
             document.documentElement.style.setProperty('overflow', 'auto', 'important');
             document.body.classList.remove('x1n2onr6');
             document.documentElement.classList.remove('x1n2onr6');
        };

        // Scroll and Scrape Loop
        console.log('Scrolling and scraping...');
        // We'll scroll multiple times to load content
        for (let i = 0; i < 5; i++) {
            await page.evaluate(removeBlockingPopups); // Clean before scroll
            await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
            await new Promise(r => setTimeout(r, 2000));
            await page.evaluate(removeBlockingPopups); // Clean after scroll
        }

        // Detect Page Type
        const currentUrl = page.url();
        const isSearchPage = currentUrl.includes('/search/');
        console.log(`Page detected: ${isSearchPage ? 'Search Results' : 'Events Home'}`);

        // Extract Data
        console.log('Extracting event data...');
        const events = await page.evaluate((isSearchPage) => {
            const results = [];
           
            if (isSearchPage) {
                // --- STRATEGY A: SEARCH RESULTS PAGE ---
                const cards = Array.from(document.querySelectorAll('div[role="article"]'));
                cards.forEach(card => {
                    const linkEl = card.closest('a');
                    if (!linkEl || !linkEl.href.includes('/events/')) return;
                   
                    const img = card.querySelector('img');
                    const imgSrc = img ? img.src : null;

                    let title = 'N/A';
                    const titleEl = card.querySelector('span[style*="-webkit-line-clamp: 2"]');
                    if (titleEl) title = titleEl.innerText;
                    else {
                        const h3 = card.querySelector('h3');
                        if (h3) title = h3.innerText;
                    }

                    const spans = Array.from(card.querySelectorAll('span'))
                        .map(s => s.innerText.trim())
                        .filter(t => t.length > 0);
                    const date = spans.length > 0 ? spans[0] : 'N/A';
                   
                    let location = 'N/A';
                    const titleIndex = spans.indexOf(title);
                    if (titleIndex !== -1 && titleIndex + 1 < spans.length) {
                        location = spans[titleIndex + 1];
                    } else if (spans.length >= 3) {
                        location = spans[2];
                    }

                    results.push({
                        title,
                        date,
                        location,
                        link: linkEl.href.split('?')[0].replace('web.facebook.com', 'www.facebook.com'),
                        imageUrl: imgSrc
                    });
                });

            } else {
                // --- STRATEGY B: EVENTS HOME PAGE (Grid View) ---
                // Cards are essentially links with images
                const potentialCards = Array.from(document.querySelectorAll('a[href*="/events/"]'))
                    .filter(a => a.querySelector('img') && a.innerText.trim().length > 5);

                potentialCards.forEach(card => {
                    const link = card.href.split('?')[0];
                    const img = card.querySelector('img');
                    const imgSrc = img ? img.src : null;

                    // Text extraction from the card
                    // Usually lines are: Date, Title, Location, or similar
                    const lines = card.innerText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                   
                    // Simple heuristic for Home Page Grid
                    // 0: Date (often "Fri, 27 Mar...")
                    // 1: Title
                    // 2: Location or Online
                   
                    if (lines.length >= 2) {
                        results.push({
                            title: lines[1] || lines[0], // Fallback
                            date: lines[0],
                            location: lines[2] || 'Online/N/A',
                            link: link.replace('web.facebook.com', 'www.facebook.com'),
                            imageUrl: imgSrc
                        });
                    }
                });
            }
            return results;
        }, isSearchPage);

        console.log(`Found ${events.length} events.`);
        await browser.close();
        return events;

    } catch (error) {
        console.error('Error in scraper:', error);
        if (browser) await browser.close();
        return [];
    }
}
