export const WebtoonAdapter = {
  name: 'Webtoon Adapter',
  domains: ['webtoons.com', 'webtoon.xyz'],

  canHandle(url) {
    const lower = (url || '').toLowerCase();
    return this.domains.some((d) => lower.includes(d));
  },

  async getMangaInfo(url) {
    let domain = 'webtoons.com';
    try { domain = new URL(url).hostname; } catch (e) {}

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Referer': `https://${domain}/`,
      },
    });

    const html = res.ok ? await res.text() : '';
    let title = 'Webtoon Series';
    let chapterNumber = 1;

    const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const raw = (ogMatch && ogMatch[1]) || (titleMatch && titleMatch[1]) || '';

    if (raw) {
      title = raw
        .replace(/[-|].*WEBTOON.*/gi, '')
        .replace(/[-|].*LINE.*/gi, '')
        .replace(/-?\s*Ep(?:isode)?\.?\s*\d+.*/gi, '')
        .trim();
    }

    const epMatch = url.match(/episode_no=(\d+)/i) || html.match(/Ep(?:isode)?\.?\s*(\d+)/i);
    if (epMatch) chapterNumber = parseInt(epMatch[1], 10);

    return { title, chapterNumber, sourceName: 'Webtoon', sourceUrl: url, html };
  },

  async getChapterImages(url, htmlContent) {
    const images = [];
    const html = htmlContent || '';

    // Webtoon uses #_imageList img or .viewer_img img
    const regex = /<img[^>]+(?:data-url|data-src|src)=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = regex.exec(html)) !== null) {
      const src = m[1].trim();
      if (
        src &&
        !src.startsWith('data:') &&
        (src.includes('webtoon') || src.includes('phinf.wevpstatic') || src.includes('cdnwebtoon') ||
         src.includes('/content/') || src.includes('.jpg') || src.includes('.png') || src.includes('.webp')) &&
        !src.includes('logo') && !src.includes('favicon') && !src.includes('thumbnail') &&
        !src.includes('avatar') && !src.includes('icon') && !src.includes('banner') &&
        !src.includes('_profile') && !src.includes('90x90') && !src.includes('150x')
      ) {
        let full = src.startsWith('//') ? 'https:' + src : src;
        if (!images.includes(full)) images.push(full);
      }
    }

    return images;
  },
};
