async function testScrape() {
  try {
    const url = 'https://thuviensach.vn/truyen-tranh/toi-thang-cap-mot-minh-solo-leveling-14806-chap-1.html';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Referer': 'https://thuviensach.vn/',
      }
    });
    const html = await res.text();
    console.log('HTML Length:', html.length);
    
    // Find all images
    const regex = /<img[^>]+(?:src|data-src|data-original)=["']([^"']+)["'][^>]*>/gi;
    let match;
    const images = [];
    while ((match = regex.exec(html)) !== null) {
      const src = match[1];
      if (src && !src.includes('logo') && !src.includes('banner') && !src.includes('icon') && !src.includes('favicon')) {
        images.push(src);
      }
    }
    console.log('Chapter Images found:', images.length);
    console.log('Sample images:', images.slice(0, 5));
    
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    console.log('Extracted Title:', titleMatch ? titleMatch[1] : 'Unknown');
  } catch (err) {
    console.error('Error:', err);
  }
}
testScrape();
