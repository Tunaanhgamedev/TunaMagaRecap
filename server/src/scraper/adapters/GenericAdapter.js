export const GenericAdapter = {
  name: 'Generic Universal HTML5 Adapter',
  domains: ['*'],

  canHandle(url) {
    return true; // Catch-all fallback
  },

  async getMangaInfo(url) {
    let domain = 'google.com';
    try {
      domain = new URL(url).hostname;
    } catch (e) {}

    let html = '';
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Referer': `https://${domain}/`,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        },
      });
      if (res.ok) html = await res.text();
    } catch (e) {}

    let title = 'Truyện Tranh Mới';
    let chapterNumber = 1;

    // Extract Title from HTML
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const titleTag = html.match(/<title>([^<]+)<\/title>/i);
    const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const raw = (ogTitle && ogTitle[1]) || (titleTag && titleTag[1]) || (h1 && h1[1]) || '';

    if (raw) {
      title = raw
        .replace(/Truyện Tranh\s*/gi, '')
        .replace(/Đọc Truyện\s*/gi, '')
        .replace(/[-|].*/gi, '')
        .replace(/-?\s*Chap(?:ter)?\s*\d+.*/gi, '')
        .trim();
    }

    if (!title || title.length < 2) {
      try {
        const u = new URL(url);
        const parts = u.pathname.split('/').filter(Boolean);
        title = (parts[parts.length - 1] || 'Truyện Mới')
          .replace(/\.html.*$/i, '')
          .replace(/[-_]chap(?:ter)?[-_]\d+.*$/i, '')
          .split(/[-_]/)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ');
      } catch (e) {}
    }

    const cMatch = url.match(/chap(?:ter)?[-_\s]?(\d+)/i) || html.match(/Chap(?:ter)?\s*(\d+)/i);
    if (cMatch) chapterNumber = parseInt(cMatch[1], 10);

    return {
      title,
      chapterNumber,
      sourceName: `Generic Web (${domain})`,
      sourceUrl: url,
      html,
    };
  },

  async getChapterImages(url, htmlContent) {
    const images = [];
    const html = htmlContent || '';
    let domain = 'google.com';
    try {
      domain = new URL(url).hostname;
    } catch (e) {}

    // Parse all images from any container with lazy load attributes
    const regex = /<img[^>]+(?:data-src|data-original|data-cdn|data-lazy-src|data-url|data-srcset|srcset|src)=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = regex.exec(html)) !== null) {
      let src = m[1].trim();
      if (src.includes(' ')) src = src.split(' ')[0];

      if (
        src &&
        !src.startsWith('data:') &&
        (src.includes('.webp') ||
          src.includes('.jpg') ||
          src.includes('.jpeg') ||
          src.includes('.png') ||
          src.includes('chapter') ||
          src.includes('page') ||
          src.includes('comic') ||
          src.includes('cdn') ||
          src.includes('truyen') ||
          src.includes('manga') ||
          src.includes('upload') ||
          src.includes('storage')) &&
        !src.includes('logo') &&
        !src.includes('favicon') &&
        !src.includes('banner') &&
        !src.includes('avatar') &&
        !src.includes('icon') &&
        !src.includes('ads')
      ) {
        let full = src;
        if (src.startsWith('//')) full = 'https:' + src;
        else if (src.startsWith('/')) full = `https://${domain}${src}`;
        else if (!src.startsWith('http')) full = `https://${domain}/${src}`;

        if (!images.includes(full)) images.push(full);
      }
    }

    return images;
  },
};
