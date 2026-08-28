export const BlogTruyenAdapter = {
  name: 'BlogTruyen Adapter',
  domains: [
    'blogtruyen.vn', 'blogtruyen.com', 'blogtruyenmoi.com',
    'blogtruyenvn.com', 'blogtruyen.net',
  ],

  canHandle(url) {
    const lower = (url || '').toLowerCase();
    return this.domains.some((d) => lower.includes(d));
  },

  async getMangaInfo(url) {
    let domain = 'blogtruyen.vn';
    try { domain = new URL(url).hostname; } catch (e) {}

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Referer': `https://${domain}/`,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const html = res.ok ? await res.text() : '';
    let title = 'Truyện Tranh BlogTruyen';
    let chapterNumber = 1;

    const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const raw = (ogMatch && ogMatch[1]) || (titleMatch && titleMatch[1]) || '';

    if (raw) {
      title = raw
        .replace(/BlogTruyen.*$/gi, '')
        .replace(/[-|].*BlogTruyen.*/gi, '')
        .replace(/-?\s*Chap(?:ter)?\s*\d+.*/gi, '')
        .replace(/Đọc Truyện\s*/gi, '')
        .replace(/Truyện Tranh\s*/gi, '')
        .trim();
    }

    const cMatch = url.match(/chap(?:ter)?[-_\s]?(\d+)/i) || url.match(/\/c(\d+)\b/i) || html.match(/Chap(?:ter)?\s*(\d+)/i);
    if (cMatch) chapterNumber = parseInt(cMatch[1], 10);

    return { title, chapterNumber, sourceName: 'BlogTruyen', sourceUrl: url, html };
  },

  async getChapterImages(url, htmlContent) {
    const images = [];
    const html = htmlContent || '';

    // BlogTruyen uses #content img or .reading-detail img
    const regex = /<img[^>]+(?:src|data-src|data-original)=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = regex.exec(html)) !== null) {
      const src = m[1].trim();
      if (
        src &&
        !src.startsWith('data:') &&
        (src.includes('blogtruyenmoi') || src.includes('blogtruyen') || src.includes('/uploads/') ||
         src.includes('.jpg') || src.includes('.png') || src.includes('.webp')) &&
        !src.includes('logo') && !src.includes('favicon') && !src.includes('banner') &&
        !src.includes('avatar') && !src.includes('ads') && !src.includes('icon') &&
        !src.includes('thumb') && !src.includes('150x')
      ) {
        let full = src.startsWith('//') ? 'https:' + src : src;
        if (!images.includes(full)) images.push(full);
      }
    }

    return images;
  },
};
