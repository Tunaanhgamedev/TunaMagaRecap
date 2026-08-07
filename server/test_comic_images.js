async function checkAllComicImages() {
  const url = 'https://thuviensach.vn/truyen-tranh/toi-thang-cap-mot-minh-solo-leveling-14806-chap-1.html';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });
  const html = await res.text();
  
  const comicRegex = /<img[^>]+src=["']([^"']*\/img\/comic\/[^"']+)["'][^>]*>/gi;
  let m;
  const comicImages = [];
  while ((m = comicRegex.exec(html)) !== null) {
    const fullUrl = `https://thuviensach.vn${m[1].startsWith('/') ? '' : '/'}${m[1]}`;
    comicImages.push(fullUrl);
  }
  console.log('Total /img/comic/ images in Chapter 1:', comicImages.length);
  console.log('First 5 comic images:', comicImages.slice(0, 5));
  console.log('Last 3 comic images:', comicImages.slice(-3));
}

checkAllComicImages();
