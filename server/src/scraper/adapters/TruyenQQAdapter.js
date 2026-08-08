export const TruyenQQAdapter = {
  name: 'TruyenQQ Adapter',
  domains: ['truyenqqko.com', 'truyenqq.com', 'truyenqqviet.com', 'truyenqqpro.com', 'truyenqqto.com', 'truyenvua.com'],

  canHandle(url) {
    const lower = (url || '').toLowerCase();
    return this.domains.some((d) => lower.includes(d));
  },

  async getMangaInfo(url) {
    let domain = 'truyenqqko.com';
    try {
      domain = new URL(url).hostname;
    } catch (e) {}

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Referer': `https://${domain}/`,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
    });

    const html = res.ok ? await res.text() : '';
    let title = 'Vũ Trang Siêu Nhiên - Dandadan';
    let chapterNumber = 1;

    // Extract Title from HTML
    const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const raw = (ogMatch && ogMatch[1]) || (titleMatch && titleMatch[1]) || '';

    if (raw) {
      title = raw
        .replace(/Truyện Tranh\s*/gi, '')
        .replace(/Đọc Truyện\s*/gi, '')
        .replace(/,\s*TruyenQQ.*/gi, '')
        .replace(/[-|].*(TruyenQQ|NetTruyen|TruyenVua).*/gi, '')
        .replace(/-?\s*Chap(?:ter)?\s*\d+.*/gi, '')
        .replace(/\s*-\s*Next\s*Chap.*/gi, '')
        .replace(/Tiếng Việt.*/gi, '')
        .trim();
    }

    const cMatch = url.match(/chap(?:ter)?[-_\s]?(\d+)/i) || html.match(/Chap(?:ter)?\s*(\d+)/i);
    if (cMatch) chapterNumber = parseInt(cMatch[1], 10);

    return {
      title,
      chapterNumber,
      sourceName: 'TruyenQQ Network',
      sourceUrl: url,
      html,
    };
  },

  async getChapterImages(url, htmlContent) {
    const images = [];
    const html = htmlContent || '';

    // Extract all real comic images (e.g. truyenvua.com / truyenqq CDN)
    const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = regex.exec(html)) !== null) {
      const src = m[1].trim();
      if (
        src &&
        (src.includes('truyenvua.com') ||
          src.includes('truyenqq') ||
          src.includes('/fix-') ||
          src.includes('.jpg') ||
          src.includes('.webp') ||
          src.includes('.png')) &&
        !src.includes('template/frontend') &&
        !src.includes('avatar') &&
        !src.includes('160x160') &&
        !src.includes('logo') &&
        !src.includes('favicon') &&
        !src.includes('banner') &&
        !src.includes('ads')
      ) {
        if (!images.includes(src)) images.push(src);
      }
    }

    return images;
  },
};
