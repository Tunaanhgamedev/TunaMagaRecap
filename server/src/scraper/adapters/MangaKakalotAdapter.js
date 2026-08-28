export const MangaKakalotAdapter = {
  name: 'MangaKakalot Adapter',
  domains: [
    'mangakakalot.com', 'mangakakalot.tv', 'manganato.com', 'manganelo.com',
    'readmanganato.com', 'chapmanganato.com', 'chapmanganelo.com',
    'mangabuddy.com', 'mangapill.com',
  ],

  canHandle(url) {
    const lower = (url || '').toLowerCase();
    return this.domains.some((d) => lower.includes(d));
  },

  async getMangaInfo(url) {
    let domain = 'mangakakalot.com';
    try { domain = new URL(url).hostname; } catch (e) {}

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Referer': `https://${domain}/`,
      },
    });

    const html = res.ok ? await res.text() : '';
    let title = 'Manga';
    let chapterNumber = 1;

    const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const raw = (ogMatch && ogMatch[1]) || (titleMatch && titleMatch[1]) || (h1 && h1[1]) || '';

    if (raw) {
      title = raw
        .replace(/[-|].*(Mangakakalot|Manganato|Manganelo|MangaBuddy|MangaPill).*/gi, '')
        .replace(/-?\s*Chapter\s*\d+.*/gi, '')
        .replace(/Read\s*/gi, '')
        .replace(/Manga Online\s*/gi, '')
        .trim();
    }

    const cMatch = url.match(/chapter[-_\s]?(\d+)/i) || html.match(/Chapter\s*(\d+)/i);
    if (cMatch) chapterNumber = parseInt(cMatch[1], 10);

    return { title, chapterNumber, sourceName: `MangaKakalot (${domain})`, sourceUrl: url, html };
  },

  async getChapterImages(url, htmlContent) {
    const images = [];
    const html = htmlContent || '';
    let domain = 'mangakakalot.com';
    try { domain = new URL(url).hostname; } catch (e) {}

    // Mangakakalot/Manganato use .container-chapter-reader img
    const regex = /<img[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = regex.exec(html)) !== null) {
      const src = m[1].trim();
      if (
        src &&
        !src.startsWith('data:') &&
        (src.includes('/chapter/') || src.includes('/manga/') || src.includes('blogspot') ||
         src.includes('cdn') || src.includes('upload') || src.includes('img') ||
         src.includes('.jpg') || src.includes('.png') || src.includes('.webp')) &&
        !src.includes('logo') && !src.includes('favicon') && !src.includes('banner') &&
        !src.includes('avatar') && !src.includes('icon') && !src.includes('ads') &&
        !src.includes('fb_icon') && !src.includes('200x') && !src.includes('thumb')
      ) {
        let full = src.startsWith('//') ? 'https:' + src : src;
        if (!images.includes(full)) images.push(full);
      }
    }

    return images;
  },
};
