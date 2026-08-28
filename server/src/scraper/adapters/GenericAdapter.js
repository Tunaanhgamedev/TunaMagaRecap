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
    try { domain = new URL(url).hostname; } catch (e) {}

    // Try to extract reading container content first (most manga sites wrap images in a specific div)
    const readingContainerPatterns = [
      /class=["'][^"']*(?:reading-detail|chapter-content|page-chapter|lst-content|chapter_content|content-manga|manga-reading|comic-content|viewer|listImgChapter)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      /id=["'][^"']*(?:content|chapter-content|page-chapter|listImgChapter|reading-detail|all-page|viewer)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
    ];

    let contentHtml = html;
    for (const pattern of readingContainerPatterns) {
      const containerMatch = pattern.exec(html);
      if (containerMatch && containerMatch[1]) {
        const containerImages = [];
        const imgRegex = /<img[^>]+(?:data-src|data-original|data-cdn|data-lazy-src|data-url|src)=["']([^"']+)["'][^>]*>/gi;
        let m;
        while ((m = imgRegex.exec(containerMatch[1])) !== null) {
          let src = m[1].trim();
          if (src.includes(' ')) src = src.split(' ')[0];
          if (src && !src.startsWith('data:') && !src.includes('logo') && !src.includes('favicon') &&
              !src.includes('icon') && !src.includes('avatar') && !src.includes('ads') && !src.includes('banner')) {
            let full = src.startsWith('//') ? 'https:' + src : src.startsWith('/') ? `https://${domain}${src}` : !src.startsWith('http') ? `https://${domain}/${src}` : src;
            if (!containerImages.includes(full)) containerImages.push(full);
          }
        }
        if (containerImages.length >= 3) return containerImages;
      }
    }

    // Fallback: Parse all images from HTML with lazy load attributes
    const regex = /<img[^>]+(?:data-src|data-original|data-cdn|data-lazy-src|data-url|data-srcset|srcset|src)=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = regex.exec(html)) !== null) {
      let src = m[1].trim();
      if (src.includes(' ')) src = src.split(' ')[0];

      // Check if the img tag has width/height hints suggesting a very small image (icon, thumb)
      const fullTag = m[0];
      const widthMatch = fullTag.match(/width=["']?(\d+)/i);
      const heightMatch = fullTag.match(/height=["']?(\d+)/i);
      if (widthMatch && parseInt(widthMatch[1]) < 100) continue;
      if (heightMatch && parseInt(heightMatch[1]) < 100) continue;

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
          src.includes('storage') ||
          src.includes('content') ||
          src.includes('reading') ||
          src.includes('img_')) &&
        !src.includes('logo') &&
        !src.includes('favicon') &&
        !src.includes('banner') &&
        !src.includes('avatar') &&
        !src.includes('icon') &&
        !src.includes('ads') &&
        !src.includes('thumb') &&
        !src.includes('150x') &&
        !src.includes('200x') &&
        !src.includes('template/') &&
        !src.includes('user/') &&
        !src.includes('cover')
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

