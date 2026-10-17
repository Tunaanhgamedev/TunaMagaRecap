export const MangaPillAdapter = {
  name: 'MangaPill Adapter',
  domains: ['mangapill.com'],

  canHandle(url) {
    const lower = (url || '').toLowerCase();
    return lower.includes('mangapill.com');
  },

  async getMangaInfo(url) {
    let domain = 'mangapill.com';
    try {
      domain = new URL(url).hostname;
    } catch (e) {}

    let html = '';
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Referer': 'https://mangapill.com/',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        },
      });
      if (res.ok) html = await res.text();
    } catch (e) {
      console.log('[MangaPill] Fetch error:', e.message);
    }

    let title = 'MangaPill Manga';
    let chapterNumber = 1;

    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const titleTag = html.match(/<title>([^<]+)<\/title>/i);
    const raw = (ogTitle && ogTitle[1]) || (titleTag && titleTag[1]) || '';

    if (raw) {
      title = raw
        .replace(/[-|].*(MangaPill|Manga).*/gi, '')
        .replace(/-?\s*Chapter\s*\d+.*/gi, '')
        .replace(/Read\s*/gi, '')
        .trim();
    }

    const cMatch = url.match(/chapter[-_\s]?(\d+(?:\.\d+)?)/i) || html.match(/Chapter\s*(\d+(?:\.\d+)?)/i);
    if (cMatch) chapterNumber = parseFloat(cMatch[1]);

    return {
      title: title || 'Manga',
      chapterNumber,
      sourceName: 'MangaPill',
      sourceUrl: url,
      html,
    };
  },

  async getChapterImages(url, htmlContent) {
    const images = [];
    let html = htmlContent || '';

    if (!html) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Referer': 'https://mangapill.com/',
          },
        });
        if (res.ok) html = await res.text();
      } catch (e) {}
    }

    // MangaPill uses <img class="js-page" data-src="..." ...>
    const regex = /<img[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = regex.exec(html)) !== null) {
      const src = m[1].trim();
      if (
        src &&
        !src.startsWith('data:') &&
        (src.includes('readdetectiveconan') ||
          src.includes('/file/mangap/') ||
          src.includes('/chapters/') ||
          src.includes('.jpeg') ||
          src.includes('.jpg') ||
          src.includes('.webp') ||
          src.includes('.png')) &&
        !src.includes('logo') &&
        !src.includes('banner') &&
        !src.includes('icon') &&
        !src.includes('/i/') // /i/ is cover thumbnail
      ) {
        let full = src.startsWith('//') ? 'https:' + src : src;
        if (!images.includes(full)) images.push(full);
      }
    }

    return images;
  },

  async discoverSeries(url) {
    const rawUrl = (url || '').trim();
    let seriesUrl = rawUrl;

    // Check if this is a chapter URL: https://mangapill.com/chapters/2-11110000/one-piece-chapter-1110
    const chapterIdMatch = rawUrl.match(/\/chapters\/(\d+)-/i);
    if (chapterIdMatch) {
      seriesUrl = `https://mangapill.com/manga/${chapterIdMatch[1]}`;
    }

    let html = '';
    try {
      const res = await fetch(seriesUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Referer': 'https://mangapill.com/',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        },
      });
      if (res.ok) {
        html = await res.text();
      }
    } catch (e) {
      console.log('[MangaPill] Series fetch error:', e.message);
    }

    // If still empty and was chapter URL, try reading the chapter HTML to find /manga/\d+ link
    if (!html && rawUrl !== seriesUrl) {
      try {
        const cRes = await fetch(rawUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Referer': 'https://mangapill.com/',
          },
        });
        if (cRes.ok) {
          const cHtml = await cRes.text();
          const backLink = cHtml.match(/href=["'](\/manga\/\d+(?:\/[^"']*)?)["']/i);
          if (backLink) {
            seriesUrl = `https://mangapill.com${backLink[1]}`;
            const sRes = await fetch(seriesUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Referer': 'https://mangapill.com/',
              },
            });
            if (sRes.ok) html = await sRes.text();
          }
        }
      } catch (e) {}
    }

    // 1. Extract Title
    let title = 'Manga Series';
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const titleTag = html.match(/<title>([^<]+)<\/title>/i);
    const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const raw = (ogTitle && ogTitle[1]) || (titleTag && titleTag[1]) || (h1 && h1[1]) || '';

    if (raw) {
      title = raw
        .replace(/[-|].*(MangaPill|Manga).*/gi, '')
        .replace(/-?\s*Chapter\s*\d+.*/gi, '')
        .replace(/Read\s*/gi, '')
        .trim();
    }

    // 2. Extract Cover
    let coverUrl = '';
    const ogImg = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogImg) coverUrl = ogImg[1];

    // 3. Extract Chapters
    const chapters = [];
    const chRegex = /<a[^>]+href=["'](\/chapters\/\d+-\d+\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let m;
    while ((m = chRegex.exec(html)) !== null) {
      const href = m[1];
      const text = m[2].replace(/<[^>]+>/g, '').trim();
      const numMatch = text.match(/chapter\s*(\d+(?:\.\d+)?)/i) || href.match(/chapter-(\d+(?:\.\d+)?)/i);
      const num = numMatch ? parseFloat(numMatch[1]) : 0;
      const full = `https://mangapill.com${href}`;

      if (!chapters.some((c) => c.url === full)) {
        chapters.push({
          chapterNumber: num || 1,
          title: text || `Chapter ${num}`,
          url: full,
        });
      }
    }

    // Sort ascending by chapterNumber
    chapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));

    return {
      success: true,
      adapterName: this.name,
      series: {
        name: title,
        coverUrl: coverUrl ? `/api/proxy-image?url=${encodeURIComponent(coverUrl)}&referer=${encodeURIComponent('https://mangapill.com/')}` : '',
        rawCoverUrl: coverUrl,
        sourceUrl: seriesUrl,
        seriesSlug: seriesUrl.split('/').pop() || '',
      },
      totalChapters: chapters.length,
      chapters,
    };
  },
};
