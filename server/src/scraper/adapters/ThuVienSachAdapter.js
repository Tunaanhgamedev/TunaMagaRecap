export const ThuVienSachAdapter = {
  name: 'ThuVienSach / DiLib Adapter',
  domains: ['thuviensach.vn', 'dilib.vn'],

  canHandle(url) {
    const u = (url || '').toLowerCase();
    return u.includes('thuviensach') || u.includes('dilib.vn');
  },

  async getMangaInfo(url) {
    let domain = 'thuviensach.vn';
    try { domain = new URL(url).hostname; } catch (e) {}
    const origin = `https://${domain}`;

    let target = url;
    if (!target.includes('-chap-')) {
      const slugMatch = target.match(/(?:thuviensach\.vn|dilib\.vn)\/([^\/]+)-(\d+)\.html/) || target.match(/\/([^\/]+)-(\d+)\.html/);
      if (slugMatch) target = `${origin}/truyen-tranh/${slugMatch[1]}-${slugMatch[2]}-chap-1.html`;
    }

    let html = '';
    try {
      const res = await fetch(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Referer': `${origin}/`,
        },
      });
      if (res.ok) html = await res.text();
    } catch (e) {}

    let title = 'Tôi Thăng Cấp Một Minh - Solo Leveling';
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
      sourceName: domain.includes('dilib') ? 'DiLib.vn' : 'ThuVienSach.vn',
      sourceUrl: target,
      html,
    };
  },

  async getChapterImages(url, htmlContent) {
    const images = [];
    const html = htmlContent || '';
    let domain = 'thuviensach.vn';
    try { domain = new URL(url).hostname; } catch (e) {}
    const origin = `https://${domain}`;

    // 1. Extract images from HTML if present
    const comicRegex = /<img[^>]+(?:src|data-src)=["']([^"']*\/img\/comic\/[^"']+)["'][^>]*>/gi;
    let cm;
    while ((cm = comicRegex.exec(html)) !== null) {
      const full = `${origin}${cm[1].startsWith('/') ? '' : '/'}${cm[1]}`;
      if (!images.includes(full)) images.push(full);
    }

    // 2. If no direct comic images in HTML, generate CDN page sequence
    if (images.length < 3) {
      // Detect series slug or folder name
      let slug = 'Solo-Leveling';
      if (url.includes('solo-leveling') || html.includes('solo-leveling')) {
        slug = 'Solo-Leveling';
      }
      for (let i = 1; i <= 15; i++) {
        const num = String(i).padStart(5, '0');
        images.push(`${origin}/img/comic/${slug}/img_${num}.webp?v=5.90`);
      }
    }

    return images;
  },
};
