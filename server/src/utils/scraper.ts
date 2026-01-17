import puppeteer from "puppeteer";

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
            userAgent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        });

        // Direct navigation to Events page
        console.log("Navigating to Events page...");
        await page.goto("https://www.facebook.com/events", {
            waitUntil: "networkidle2",
        });

        // Wait specifically for the login popup or fields to settle
        try {
            await page.waitForSelector('input[name="email"]', {
                timeout: 10000,
            });
        } catch (e) {
            console.log(
                "Login inputs not found immediately. Checking frames or manual interaction might be needed."
            );
        }

        console.log("Logging in via popup...");
        await page.type('input[name="email"]', "eventhorizon6767@gmail.com", {
            delay: 100,
        });
        await page.type('input[name="pass"]', "testpassword@1209", {
            delay: 100,
        });

        await page.keyboard.press("Enter");

        console.log("Login submitted. Waiting for load...");
        await page.waitForNavigation({
            waitUntil: "networkidle2",
            timeout: 60000,
        });

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
                            link: foundLink.href,
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
