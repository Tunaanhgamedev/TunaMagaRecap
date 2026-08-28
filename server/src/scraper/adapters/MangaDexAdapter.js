export const MangaDexAdapter = {
  name: 'MangaDex Adapter',
  domains: ['mangadex.org', 'mangadex.tv'],

  canHandle(url) {
    const lower = (url || '').toLowerCase();
    return this.domains.some((d) => lower.includes(d));
  },

  async getMangaInfo(url) {
    let title = 'MangaDex Manga';
    let chapterNumber = 1;
    let html = '';

    // MangaDex uses API at api.mangadex.org - try to extract chapter ID from URL
    // URL format: https://mangadex.org/chapter/{chapter-id}
    const chapterIdMatch = url.match(/\/chapter\/([a-f0-9-]+)/i);

    if (chapterIdMatch) {
      try {
        const chapterId = chapterIdMatch[1];
        const apiRes = await fetch(`https://api.mangadex.org/chapter/${chapterId}?includes[]=manga`, {
          headers: { 'User-Agent': 'TunaRecap/1.0' },
        });
        if (apiRes.ok) {
          const data = await apiRes.json();
          const chapter = data.data;
          chapterNumber = parseInt(chapter.attributes?.chapter || '1', 10) || 1;

          // Get manga title from relationships
          const mangaRel = chapter.relationships?.find(r => r.type === 'manga');
          if (mangaRel?.attributes?.title) {
            title = mangaRel.attributes.title.en || mangaRel.attributes.title.vi ||
                    Object.values(mangaRel.attributes.title)[0] || title;
          }
        }
      } catch (e) {
        console.log('[MangaDex] API error:', e.message);
      }
    }

    return { title, chapterNumber, sourceName: 'MangaDex', sourceUrl: url, html, _chapterId: chapterIdMatch?.[1] };
  },

  async getChapterImages(url, htmlContent, info) {
    const images = [];

    // Extract chapter ID from URL
    const chapterIdMatch = url.match(/\/chapter\/([a-f0-9-]+)/i);
    if (!chapterIdMatch) return images;

    const chapterId = chapterIdMatch[1];

    try {
      // MangaDex AtHome API for image delivery
      const res = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`, {
        headers: { 'User-Agent': 'TunaRecap/1.0' },
      });

      if (res.ok) {
        const data = await res.json();
        const baseUrl = data.baseUrl;
        const hash = data.chapter?.hash;
        const pages = data.chapter?.data || []; // Full quality
        const dataSaver = data.chapter?.dataSaver || []; // Compressed

        // Use full quality images
        for (const page of pages) {
          images.push(`${baseUrl}/data/${hash}/${page}`);
        }

        // Fallback to dataSaver if no full quality
        if (images.length === 0) {
          for (const page of dataSaver) {
            images.push(`${baseUrl}/data-saver/${hash}/${page}`);
          }
        }
      }
    } catch (e) {
      console.log('[MangaDex] AtHome API error:', e.message);
    }

    return images;
  },
};
