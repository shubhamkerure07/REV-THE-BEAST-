import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUTPUT_DIR = path.resolve('docs', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('Launching Edge for live screenshots...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();

  // 1. Home / Hero
  console.log('Capturing 01_hero.png...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await delay(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_hero.png') });

  // 2. Story Scroll
  console.log('Capturing 02_story_scroll.png...');
  await page.evaluate(() => {
    window.scrollBy({ top: 950, behavior: 'instant' });
  });
  await delay(1500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_story_scroll.png') });

  // 3. Garage View
  console.log('Capturing 03_garage.png...');
  await page.evaluate(() => {
    // Click garage nav button
    const btns = Array.from(document.querySelectorAll('button'));
    const garageBtn = btns.find(b => b.textContent && b.textContent.includes('GARAGE'));
    if (garageBtn) garageBtn.click();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await delay(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_garage.png') });

  // 4. Car Detail
  console.log('Capturing 04_car_detail.png...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const storyBtn = btns.find(b => b.textContent && b.textContent.includes('STORY'));
    if (storyBtn) storyBtn.click();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await delay(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_car_detail.png') });

  // 5. Sound Lab
  console.log('Capturing 05_sound_lab.png...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const soundLabBtn = btns.find(b => b.textContent && b.textContent.includes('SOUND LAB'));
    if (soundLabBtn) soundLabBtn.click();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await delay(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05_sound_lab.png') });

  // 6. Racing Simulator
  console.log('Capturing 06_racing.png...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const circuitBtn = btns.find(b => b.textContent && b.textContent.includes('CIRCUIT'));
    if (circuitBtn) circuitBtn.click();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await delay(2000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_racing.png') });

  await browser.close();
  console.log('All screenshots captured successfully in docs/screenshots/!');
}

run().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
