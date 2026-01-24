
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const COOKIES_PATH = path.resolve(__dirname, '../../facebook_cookies.json');

(async () => {
  console.log('Launching browser for manual login...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--disable-notifications']
  });

  const page = await browser.newPage();
  
  // Emulate user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

  console.log('Navigating to Facebook...');
  await page.goto('https://www.facebook.com', { waitUntil: 'networkidle2' });

  console.log('----------------------------------------------------------------');
  console.log('PLEASE LOGIN MANUALLY IN THE BROWSER WINDOW.');
  console.log('The script will wait for you to log in.');
  console.log('Once you are logged in (and see the home feed), this script will detect it (or wait for timeout) and save cookies.');
  console.log('----------------------------------------------------------------');

  // Wait for a selector that appears when logged in (e.g. valid home feed element)
  // or simple wait for a long time if detection is tricky.
  // Using a long timeout or waiting for a specific URL change/selector is safer.
  try {
      // Wait for the main feed container or navigation bar
      await page.waitForSelector('div[role="banner"]', { timeout: 300000 }); // 5 minutes timeout
      console.log('Login detected!');
  } catch (e) {
      console.log('Timeout waiting for login detection. Attempting to save cookies anyway (you might be logged in).');
  }

  const cookies = await page.cookies();
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
  console.log(`Cookies saved to ${COOKIES_PATH}`);

  await browser.close();
})();
