export const DanTruyenAdapter = {
  name: 'DanTruyen Adapter',
  domains: [
    'dantruyen.com', 'dantruyen.net', 'dantruyen.info',
  ],

  canHandle(url) {
    const lower = (url || '').toLowerCase();
    return this.domains.some((d) => lower.includes(d));
  },

  async getMangaInfo(url) {
    let domain = 'dantruyen.com';
    try { domain = new URL(url).hostname; } catch (e) {}

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Referer': `https://${domain}/`,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const html = res.ok ? await res.text() : '';
    let title = 'Truyện Tranh DanTruyen';
    let chapterNumber = 1;

    const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const raw = (ogMatch && ogMatch[1]) || (titleMatch && titleMatch[1]) || '';

    if (raw) {
      title = raw
        .replace(/[-|].*Dân Truyện.*/gi, '')
        .replace(/[-|].*DanTruyen.*/gi, '')
        .replace(/-?\s*Chap(?:ter)?\s*\d+.*/gi, '')
        .replace(/Đọc Truyện\s*/gi, '')
        .replace(/Truyện Tranh\s*/gi, '')
        .trim();
    }

    const cMatch = url.match(/chap(?:ter)?[-_\s]?(\d+)/i) || html.match(/Chap(?:ter)?\s*(\d+)/i);
    if (cMatch) chapterNumber = parseInt(cMatch[1], 10);

    return { title, chapterNumber, sourceName: 'DanTruyen', sourceUrl: url, html };
  },

  async getChapterImages(url, htmlContent) {
    const images = [];
    const html = htmlContent || '';

    const regex = /<img[^>]+(?:data-src|data-original|data-lazy-src|src)=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = regex.exec(html)) !== null) {
      const src = m[1].trim();
      if (
        src &&
        !src.startsWith('data:') &&
        (src.includes('/uploads/') || src.includes('/chapter/') || src.includes('/manga/') ||
         src.includes('/comic/') || src.includes('/storage/') ||
         src.includes('.jpg') || src.includes('.png') || src.includes('.webp')) &&
        !src.includes('logo') && !src.includes('favicon') && !src.includes('banner') &&
        !src.includes('avatar') && !src.includes('ads') && !src.includes('icon') &&
        !src.includes('thumb')
      ) {
        let full = src.startsWith('//') ? 'https:' + src : src;
        if (!images.includes(full)) images.push(full);
      }
    }

    return images;
  },
};
