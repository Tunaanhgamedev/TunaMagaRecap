async function findRealChapterImages() {
  const url = 'https://thuviensach.vn/truyen-tranh/toi-thang-cap-mot-minh-solo-leveling-14806-chap-1.html';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://thuviensach.vn/',
    }
  });
  const html = await res.text();
  console.log('HTML Total Length:', html.length);

  // Look for any scripts mentioning 'img', 'image', 'chap', 'page', 'jpg', 'png', 'webp'
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
  console.log('Total Scripts:', scripts.length);
  
  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i][1];
    if (s.includes('.webp') || s.includes('.jpg') || s.includes('images') || s.includes('server') || s.includes('chap')) {
      console.log(`--- Script #${i} Matches ---`);
      console.log(s.slice(0, 500));
    }
  }

  // Look for all img tags with any attribute containing .webp or .jpg or .png
  const allImgs = [...html.matchAll(/<img[^>]+>/gi)].map(m => m[0]);
  console.log('Total Img tags in HTML:', allImgs.length);
  allImgs.slice(0, 15).forEach((tag, idx) => console.log(`Img #${idx}:`, tag));
}

findRealChapterImages();
