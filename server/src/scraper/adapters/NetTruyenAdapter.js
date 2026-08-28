export const NetTruyenAdapter = {
  name: 'NetTruyen Adapter',
  domains: [
    'nettruyen.com', 'nettruyenco.com', 'nettruyenmax.com', 'nettruyenvip.com',
    'nettruyengo.com', 'nettruyenfull.com', 'nettruyenhay.com', 'nettruyenmoi.com',
    'nettruyen.africa', 'nettruyen.me', 'nettruyen.top', 'nettruyen.us',
    'nhattruyen.com', 'nhattruyento.com', 'nhattruyenplus.com',
    'truyentranhlh.net', 'truyentranhlh.com',
    'doctruyen3q.com', 'doctruyen3q.net',
    'truyentranhtuan.com',
  ],

  canHandle(url) {
    const lower = (url || '').toLowerCase();
    return (
      lower.includes('nettruyen') ||
      lower.includes('nhattruyen') ||
      lower.includes('truyentranhlh') ||
      lower.includes('doctruyen3q') ||
      lower.includes('truyentranhtuan') ||
      this.domains.some((d) => lower.includes(d))
    );
  },

  async getMangaInfo(url) {
    let domain = 'nettruyenco.com';
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
    let title = 'Truyện Tranh NetTruyen';
    let chapterNumber = 1;

    const tMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (tMatch) {
      title = tMatch[1].replace(/Truyện Tranh\s*/gi, '').replace(/[-|].*(NetTruyen|NhatTruyen).*/gi, '').replace(/-?\s*Chap(?:ter)?\s*\d+.*/gi, '').trim();
    }

    const cMatch = url.match(/chap(?:ter)?[-_\s]?(\d+)/i) || html.match(/Chap(?:ter)?\s*(\d+)/i);
    if (cMatch) chapterNumber = parseInt(cMatch[1], 10);

    return {
      title,
      chapterNumber,
      sourceName: 'NetTruyen Network',
      sourceUrl: url,
      html,
    };
  },

  async getChapterImages(url, htmlContent) {
    const images = [];
    const html = htmlContent || '';

    const regex = /<img[^>]+(?:src|data-src|data-original|data-cdn)=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = regex.exec(html)) !== null) {
      const src = m[1].trim();
      if (
        src &&
        (src.includes('chapter') || src.includes('comic') || src.includes('truyen') || src.includes('.jpg') || src.includes('.png') || src.includes('.webp')) &&
        !src.includes('logo') &&
        !src.includes('banner') &&
        !src.includes('avatar')
      ) {
        let full = src.startsWith('//') ? 'https:' + src : src;
        if (!images.includes(full)) images.push(full);
      }
    }

    return images;
  },
};
