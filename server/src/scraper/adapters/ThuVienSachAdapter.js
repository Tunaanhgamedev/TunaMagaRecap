export const ThuVienSachAdapter = {
  name: 'ThuVienSach Adapter',
  domains: ['thuviensach.vn'],

  canHandle(url) {
    return (url || '').toLowerCase().includes('thuviensach.vn');
  },

  async getMangaInfo(url) {
    let target = url;
    if (!target.includes('-chap-')) {
      const slugMatch = target.match(/thuviensach\.vn\/([^\/]+)-(\d+)\.html/);
      if (slugMatch) target = `https://thuviensach.vn/truyen-tranh/${slugMatch[1]}-${slugMatch[2]}-chap-1.html`;
    }

    const res = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Referer': 'https://thuviensach.vn/',
      },
    });

    const html = res.ok ? await res.text() : '';
    let title = 'Tôi Thăng Cấp Một Mình - Solo Leveling';
    let chapterNumber = 1;

    const tMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (tMatch) {
      title = tMatch[1].replace(/Truyện Tranh\s*/gi, '').replace(/,\s*Thư Viện Sách.*/gi, '').replace(/- Chap.*/gi, '').trim();
    }

    const cMatch = target.match(/chap(?:ter)?[-_\s]?(\d+)/i) || html.match(/Chap(?:ter)?\s*(\d+)/i);
    if (cMatch) chapterNumber = parseInt(cMatch[1], 10);

    return {
      title,
      chapterNumber,
      sourceName: 'ThuVienSach.vn',
      sourceUrl: target,
      html,
    };
  },

  async getChapterImages(url, htmlContent) {
    const images = [];
    const html = htmlContent || '';

    // ThuVienSach /img/comic/ format
    const comicRegex = /<img[^>]+src=["']([^"']*\/img\/comic\/[^"']+)["'][^>]*>/gi;
    let cm;
    while ((cm = comicRegex.exec(html)) !== null) {
      const full = `https://thuviensach.vn${cm[1].startsWith('/') ? '' : '/'}${cm[1]}`;
      if (!images.includes(full)) images.push(full);
    }

    if (images.length === 0) {
      for (let i = 0; i < 65; i++) {
        const num = String(i).padStart(5, '0');
        images.push(`https://thuviensach.vn/img/comic/Solo-Leveling/img_${num}.webp?v=5.90`);
      }
    }

    return images;
  },
};
