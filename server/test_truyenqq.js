async function testRefererVariations() {
  const imgUrl = 'https://i138.truyenvua.com/11160/fix-1/0.jpg?d=dfgd6546';

  // Variation 1: Full Chapter URL
  const r1 = await fetch(imgUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Referer': 'https://truyenqqko.com/truyen-tranh/vu-trang-sieu-nhien-1-11160-chap-1',
    },
  });
  console.log('Full chapter URL referer:', r1.status, (await r1.arrayBuffer()).byteLength);

  // Variation 2: Root Domain URL
  const r2 = await fetch(imgUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Referer': 'https://truyenqqko.com/',
    },
  });
  console.log('Root domain referer:', r2.status, (await r2.arrayBuffer()).byteLength);
}

testRefererVariations();
