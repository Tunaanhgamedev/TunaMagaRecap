export const MangaToonAdapter = {
  name: 'MangaToon Adapter',
  domains: ['mangatoon.mobi', 'mangatoon.com'],

  canHandle(url) {
    const lower = (url || '').toLowerCase();
    return this.domains.some((d) => lower.includes(d));
  },

  async getMangaInfo(url) {
    let domain = 'mangatoon.mobi';
    try { domain = new URL(url).hostname; } catch (e) {}

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Referer': `https://${domain}/`,
      },
    });

    const html = res.ok ? await res.text() : '';
    let title = 'MangaToon Series';
    let chapterNumber = 1;

    const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const raw = (ogMatch && ogMatch[1]) || (titleMatch && titleMatch[1]) || '';

    if (raw) {
      title = raw
        .replace(/[-|].*MangaToon.*/gi, '')
        .replace(/-?\s*(?:Episode|Chapter|Ep\.?)\s*\d+.*/gi, '')
        .trim();
    }

    const cMatch = url.match(/episode[-_]?(\d+)/i) || url.match(/e(\d+)/i) || html.match(/Episode\s*(\d+)/i);
    if (cMatch) chapterNumber = parseInt(cMatch[1], 10);

    return { title, chapterNumber, sourceName: 'MangaToon', sourceUrl: url, html };
  },

  async getChapterImages(url, htmlContent) {
    const images = [];
    const html = htmlContent || '';

    const regex = /<img[^>]+(?:data-src|data-original|data-lazy|src)=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = regex.exec(html)) !== null) {
      const src = m[1].trim();
      if (
        src &&
        !src.startsWith('data:') &&
        (src.includes('mangatoon') || src.includes('/comic/') || src.includes('/episode/') ||
         src.includes('.jpg') || src.includes('.png') || src.includes('.webp')) &&
        !src.includes('logo') && !src.includes('favicon') && !src.includes('banner') &&
        !src.includes('avatar') && !src.includes('icon') && !src.includes('thumb') &&
        !src.includes('cover')
      ) {
        let full = src.startsWith('//') ? 'https:' + src : src;
        if (!images.includes(full)) images.push(full);
      }
    }

    return images;
  },
};
