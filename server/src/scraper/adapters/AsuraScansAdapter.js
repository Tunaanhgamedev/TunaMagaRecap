export const AsuraScansAdapter = {
  name: 'AsuraScans Adapter',
  domains: ['asuracomic.net', 'asurascans.com', 'asura.gg', 'flamecomics.xyz', 'flamescans.org'],

  canHandle(url) {
    const lower = (url || '').toLowerCase();
    return this.domains.some((d) => lower.includes(d));
  },

  async getMangaInfo(url) {
    let domain = 'asuracomic.net';
    try {
      domain = new URL(url).hostname;
    } catch (e) {}

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Referer': `https://${domain}/`,
      },
    });

    const html = res.ok ? await res.text() : '';
    let title = 'Solo Leveling (AsuraScans)';
    let chapterNumber = 178;

    const tMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (tMatch) {
      title = tMatch[1].replace(/[-|].*(Asura|Flame).*/gi, '').replace(/-?\s*Chapter\s*\d+.*/gi, '').trim();
    }

    const cMatch = url.match(/chapter[-_\s]?(\d+)/i) || html.match(/Chapter\s*(\d+)/i);
    if (cMatch) chapterNumber = parseInt(cMatch[1], 10);

    return {
      title,
      chapterNumber,
      sourceName: 'AsuraScans Network',
      sourceUrl: url,
      html,
    };
  },

  async getChapterImages(url, htmlContent) {
    const images = [];
    const html = htmlContent || '';

    const regex = /<img[^>]+(?:src|data-src|data-lazy-src)=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = regex.exec(html)) !== null) {
      const src = m[1].trim();
      if (
        src &&
        (src.includes('upload') || src.includes('chapter') || src.includes('wp-content') || src.includes('.webp') || src.includes('.jpg')) &&
        !src.includes('logo') &&
        !src.includes('banner')
      ) {
        if (!images.includes(src)) images.push(src);
      }
    }

    return images;
  },
};
