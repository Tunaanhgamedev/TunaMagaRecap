import { scraperManager } from './src/scraper/ScraperManager.js';

async function verifyTruyenQQPipeline() {
  const url = 'https://truyenqqko.com/truyen-tranh/vu-trang-sieu-nhien-1-11160-chap-1';
  console.log('Testing scraperManager on:', url);

  const res = await scraperManager.scrape(url);
  console.log('Scraper result success:', res.success);
  console.log('Scraped series name:', res.project.seriesName);
  console.log('Scraped chapter number:', res.project.chapterNumber);
  console.log('Total scraped pages:', res.pages.length);
  console.log('First 3 page image URLs:');
  console.log(res.pages.slice(0, 3).map((p) => p.imageUrl));
  console.log('First 3 raw image URLs:');
  console.log(res.pages.slice(0, 3).map((p) => p.rawImageUrl));

  // Test proxy fetch for the first image
  const firstRaw = res.pages[0].rawImageUrl;
  const proxyFetch = await fetch(firstRaw, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Referer': url,
    },
  });
  console.log('Proxy direct test status:', proxyFetch.status, 'Content-Type:', proxyFetch.headers.get('content-type'), 'Bytes:', (await proxyFetch.arrayBuffer()).byteLength);
}

verifyTruyenQQPipeline();
