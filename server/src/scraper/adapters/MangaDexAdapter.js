export const MangaDexAdapter = {
  name: 'MangaDex Adapter',
  domains: ['mangadex.org', 'mangadex.tv', 'mangadex.network'],

  canHandle(url) {
    const lower = (url || '').toLowerCase();
    return this.domains.some((d) => lower.includes(d));
  },

  async getMangaInfo(url) {
    let title = 'MangaDex Manga';
    let chapterNumber = 1;
    let html = '';
    let chapterId = '';
    let mangaId = '';

    // URL formats:
    // 1. Chapter: https://mangadex.org/chapter/{chapter-id}
    // 2. Title: https://mangadex.org/title/{manga-id} or https://mangadex.org/title/{manga-id}/{slug}
    const chapterIdMatch = url.match(/\/chapter\/([a-f0-9-]+)/i);
    const titleIdMatch = url.match(/\/title\/([a-f0-9-]+)/i);

    if (chapterIdMatch) {
      chapterId = chapterIdMatch[1];
      try {
        const apiRes = await fetch(`https://api.mangadex.org/chapter/${chapterId}?includes[]=manga`, {
          headers: { 'User-Agent': 'TunaRecap/1.0' },
        });
        if (apiRes.ok) {
          const data = await apiRes.json();
          const chapter = data.data;
          chapterNumber = parseFloat(chapter.attributes?.chapter || '1') || 1;

          // Get manga title from relationships
          const mangaRel = chapter.relationships?.find((r) => r.type === 'manga');
          if (mangaRel) {
            mangaId = mangaRel.id;
            if (mangaRel.attributes?.title) {
              title =
                mangaRel.attributes.title.en ||
                mangaRel.attributes.title.vi ||
                mangaRel.attributes.title['ja-ro'] ||
                Object.values(mangaRel.attributes.title)[0] ||
                title;
            }
          }
        }
      } catch (e) {
        console.log('[MangaDex] API error:', e.message);
      }
    } else if (titleIdMatch) {
      mangaId = titleIdMatch[1];
      try {
        const mRes = await fetch(`https://api.mangadex.org/manga/${mangaId}`, {
          headers: { 'User-Agent': 'TunaRecap/1.0' },
        });
        if (mRes.ok) {
          const mData = await mRes.json();
          const mAttr = mData.data?.attributes;
          if (mAttr?.title) {
            title =
              mAttr.title.en ||
              mAttr.title.vi ||
              mAttr.title['ja-ro'] ||
              Object.values(mAttr.title)[0] ||
              title;
          }
        }
      } catch (e) {
        console.log('[MangaDex] Title API error:', e.message);
      }
    }

    return {
      title,
      chapterNumber,
      sourceName: 'MangaDex',
      sourceUrl: url,
      html,
      _chapterId: chapterId,
      _mangaId: mangaId,
    };
  },

  async getChapterImages(url, htmlContent, info) {
    const images = [];

    // Extract chapter ID from URL or passed info
    const chapterIdMatch = url.match(/\/chapter\/([a-f0-9-]+)/i);
    const chapterId = chapterIdMatch ? chapterIdMatch[1] : info?._chapterId;
    if (!chapterId) return images;

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

        if (baseUrl && hash) {
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
      }
    } catch (e) {
      console.log('[MangaDex] AtHome API error:', e.message);
    }

    return images;
  },

  async discoverSeries(url) {
    const rawUrl = (url || '').trim();
    let mangaId = '';

    const titleIdMatch = rawUrl.match(/\/title\/([a-f0-9-]+)/i);
    const chapterIdMatch = rawUrl.match(/\/chapter\/([a-f0-9-]+)/i);

    if (titleIdMatch) {
      mangaId = titleIdMatch[1];
    } else if (chapterIdMatch) {
      // If user pasted chapter URL, query chapter metadata to find mangaId
      try {
        const chRes = await fetch(`https://api.mangadex.org/chapter/${chapterIdMatch[1]}?includes[]=manga`, {
          headers: { 'User-Agent': 'TunaRecap/1.0' },
        });
        if (chRes.ok) {
          const chData = await chRes.json();
          const mangaRel = chData.data?.relationships?.find((r) => r.type === 'manga');
          if (mangaRel) mangaId = mangaRel.id;
        }
      } catch (e) {
        console.log('[MangaDex] Error finding manga from chapter:', e.message);
      }
    }

    if (!mangaId) {
      throw new Error('Không thể tìm thấy mã Manga ID từ liên kết MangaDex.');
    }

    // 1. Fetch Manga Metadata & Cover Art
    let title = 'MangaDex Manga';
    let coverUrl = '';
    try {
      const mRes = await fetch(`https://api.mangadex.org/manga/${mangaId}?includes[]=cover_art`, {
        headers: { 'User-Agent': 'TunaRecap/1.0' },
      });
      if (mRes.ok) {
        const mData = await mRes.json();
        const mAttr = mData.data?.attributes;
        if (mAttr?.title) {
          title =
            mAttr.title.en ||
            mAttr.title.vi ||
            mAttr.title['ja-ro'] ||
            Object.values(mAttr.title)[0] ||
            title;
        }

        const coverRel = mData.data?.relationships?.find((r) => r.type === 'cover_art');
        const coverFileName = coverRel?.attributes?.fileName;
        if (coverFileName) {
          coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}`;
        }
      }
    } catch (e) {
      console.log('[MangaDex] Metadata error:', e.message);
    }

    // 2. Fetch Chapters Feed (ordered ascending by chapter)
    const chapters = [];
    try {
      const feedRes = await fetch(
        `https://api.mangadex.org/manga/${mangaId}/feed?order[chapter]=asc&limit=500&includeExternalUrl=0`,
        { headers: { 'User-Agent': 'TunaRecap/1.0' } }
      );

      if (feedRes.ok) {
        const feedData = await feedRes.json();
        const byChapter = new Map();

        for (const c of feedData.data || []) {
          if (!c.attributes?.pages || c.attributes.pages <= 0) continue;
          const num = parseFloat(c.attributes?.chapter || '1') || 1;
          const lang = (c.attributes?.translatedLanguage || '').toLowerCase();

          if (!byChapter.has(num)) {
            byChapter.set(num, []);
          }
          byChapter.get(num).push({ c, lang });
        }

        for (const [num, list] of byChapter.entries()) {
          // Prioritize: Vietnamese -> English -> first available
          const best =
            list.find((item) => item.lang === 'vi') ||
            list.find((item) => item.lang === 'en') ||
            list[0];

          const c = best.c;
          const langTag = (best.lang || 'en').toUpperCase();
          const cleanTitle = c.attributes?.title
            ? `Chapter ${num}: ${c.attributes.title} [${langTag}]`
            : `Chapter ${num} [${langTag}]`;

          chapters.push({
            chapterNumber: num,
            title: cleanTitle,
            url: `https://mangadex.org/chapter/${c.id}`,
          });
        }
      }
    } catch (e) {
      console.log('[MangaDex] Chapter feed error:', e.message);
    }

    chapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));

    return {
      success: true,
      adapterName: this.name,
      series: {
        name: title,
        coverUrl: coverUrl ? `/api/proxy-image?url=${encodeURIComponent(coverUrl)}&referer=${encodeURIComponent('https://mangadex.org/')}` : '',
        rawCoverUrl: coverUrl,
        sourceUrl: `https://mangadex.org/title/${mangaId}`,
        seriesSlug: mangaId,
      },
      totalChapters: chapters.length,
      chapters,
    };
  },
};
