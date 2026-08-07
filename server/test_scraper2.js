async function inspectThuVienSach() {
  const url = 'https://thuviensach.vn/truyen-tranh/toi-thang-cap-mot-minh-solo-leveling-14806-chap-1.html';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });
  const html = await res.text();
  
  // Find images containing '14806' or chapter images
  const regex = /<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi;
  let m;
  const chapterImgs = [];
  while ((m = regex.exec(html)) !== null) {
    const src = m[1];
    if (src.includes('14806') || src.includes('larger') || src.includes('truyen-tranh') || src.includes('chapter')) {
      const fullUrl = src.startsWith('http') ? src : `https://thuviensach.vn${src.startsWith('/') ? '' : '/'}${src}`;
      chapterImgs.push(fullUrl);
    }
  }
  console.log('Target Chapter Images Count:', chapterImgs.length);
  console.log('Chapter Images URLs:', chapterImgs);
}
inspectThuVienSach();
