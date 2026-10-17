export const WebtoonAdapter = {
  name: 'Webtoon Adapter',
  domains: ['webtoons.com', 'webtoon.xyz'],

  canHandle(url) {
    const lower = (url || '').toLowerCase();
    return this.domains.some((d) => lower.includes(d));
  },

  async getMangaInfo(url) {
    let domain = 'webtoons.com';
    try {
      domain = new URL(url).hostname;
    } catch (e) {}

    let html = '';
    let finalUrl = url;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Referer': `https://${domain}/`,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        },
        redirect: 'follow',
      });
      if (res.ok) {
        html = await res.text();
        finalUrl = res.url || url;
      }
    } catch (e) {
      console.log('[Webtoon] Fetch error:', e.message);
    }

    let title = 'Webtoon Series';
    let chapterNumber = 1;

    const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const subjMatch = html.match(/<h1[^>]*class=["'][^"']*subj[^"']*["'][^>]*>([^<]+)<\/h1>/i);
    const raw = (subjMatch && subjMatch[1]) || (ogMatch && ogMatch[1]) || (titleMatch && titleMatch[1]) || '';

    if (raw) {
      title = raw
        .replace(/[-|].*WEBTOON.*/gi, '')
        .replace(/[-|].*LINE.*/gi, '')
        .replace(/-?\s*Ep(?:isode)?\.?\s*\d+.*/gi, '')
        .trim();
    }

    const epMatch =
      finalUrl.match(/episode_?no=(\d+)/i) ||
      url.match(/episode_?no=(\d+)/i) ||
      html.match(/Ep(?:isode)?\.?\s*(\d+)/i);
    if (epMatch) chapterNumber = parseInt(epMatch[1], 10);

    return {
      title: title || 'Webtoon',
      chapterNumber,
      sourceName: 'Webtoon',
      sourceUrl: finalUrl,
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
            'Referer': 'https://www.webtoons.com/',
          },
          redirect: 'follow',
        });
        if (res.ok) html = await res.text();
      } catch (e) {}
    }

    // Webtoon isolates reading panels inside #_imageList or .viewer_img
    const containerMatch = html.match(/id=["']_imageList["'][^>]*>([\s\S]*?)<\/div>/i) ||
                           html.match(/class=["'][^"']*viewer_img[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);

    const targetHtml = containerMatch ? containerMatch[1] : html;

    const regex = /<img[^>]+(?:data-url|data-src|src)=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = regex.exec(targetHtml)) !== null) {
      const src = m[1].trim();
      if (
        src &&
        !src.startsWith('data:') &&
        (src.includes('webtoon') ||
          src.includes('phinf.wevpstatic') ||
          src.includes('cdnwebtoon') ||
          src.includes('/content/') ||
          src.includes('.jpg') ||
          src.includes('.png') ||
          src.includes('.webp')) &&
        !src.includes('logo') &&
        !src.includes('favicon') &&
        !src.includes('thumbnail') &&
        !src.includes('avatar') &&
        !src.includes('icon') &&
        !src.includes('banner') &&
        !src.includes('_profile') &&
        !src.includes('90x90') &&
        !src.includes('150x') &&
        !src.includes('crop540')
      ) {
        let full = src.startsWith('//') ? 'https:' + src : src;
        if (!images.includes(full)) images.push(full);
      }
    }

    return images;
  },

  async discoverSeries(url) {
    const rawUrl = (url || '').trim();

    // Extract title_no from URL
    const titleNoMatch = rawUrl.match(/[?&]title_?no=(\d+)/i) || rawUrl.match(/\/title\/(\d+)/i);
    const titleNo = titleNoMatch ? titleNoMatch[1] : '';

    let listUrl = rawUrl;
    if (titleNo) {
      listUrl = `https://www.webtoons.com/episodeList?titleNo=${titleNo}`;
    }

    let html = '';
    let finalUrl = listUrl;
    try {
      const res = await fetch(listUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Referer': 'https://www.webtoons.com/',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        },
        redirect: 'follow',
      });
      if (res.ok) {
        html = await res.text();
        finalUrl = res.url || listUrl;
      }
    } catch (e) {
      console.log('[Webtoon] Series list fetch error:', e.message);
    }

    // 1. Extract Title
    let title = 'Webtoon Series';
    const subjMatch = html.match(/<h1[^>]*class=["'][^"']*subj[^"']*["'][^>]*>([^<]+)<\/h1>/i);
    const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const titleTag = html.match(/<title>([^<]+)<\/title>/i);
    const raw = (subjMatch && subjMatch[1]) || (ogMatch && ogMatch[1]) || (titleTag && titleTag[1]) || '';

    if (raw) {
      title = raw
        .replace(/[-|].*WEBTOON.*/gi, '')
        .replace(/[-|].*LINE.*/gi, '')
        .replace(/-?\s*Ep(?:isode)?\.?\s*\d+.*/gi, '')
        .trim();
    }

    // 2. Extract Cover
    let coverUrl = '';
    const ogImg = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogImg) coverUrl = ogImg[1];

    // 3. Extract Episodes & Generate Complete Sequence
    const knownEpisodes = new Map();
    let maxEpisode = 1;

    const epRegex = /<li[^>]+data-episode-no=["'](\d+)["'][^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<span[^>]+class=["']subj["'][^>]*>([\s\S]*?)<\/span>/gi;
    let m;
    while ((m = epRegex.exec(html)) !== null) {
      const epNum = parseInt(m[1], 10);
      const link = m[2].startsWith('http') ? m[2] : `https://www.webtoons.com${m[2]}`;
      const epTitle = m[3].replace(/<[^>]+>/g, '').trim();
      if (epNum > maxEpisode) maxEpisode = epNum;
      knownEpisodes.set(epNum, {
        chapterNumber: epNum,
        title: epTitle || `Episode ${epNum}`,
        url: link,
      });
    }

    // If maxEpisode is greater than page 1 count, generate sequence using direct viewer URL
    const chapters = [];
    const effectiveTitleNo = titleNo || (finalUrl.match(/[?&]title_?no=(\d+)/i)?.[1]);

    for (let i = 1; i <= maxEpisode; i++) {
      if (knownEpisodes.has(i)) {
        chapters.push(knownEpisodes.get(i));
      } else {
        const epUrl = effectiveTitleNo
          ? `https://www.webtoons.com/viewer?titleNo=${effectiveTitleNo}&episodeNo=${i}`
          : `${finalUrl}&episode_no=${i}`;

        chapters.push({
          chapterNumber: i,
          title: `Episode ${i}`,
          url: epUrl,
        });
      }
    }

    chapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));

    return {
      success: true,
      adapterName: this.name,
      series: {
        name: title,
        coverUrl: coverUrl ? `/api/proxy-image?url=${encodeURIComponent(coverUrl)}&referer=${encodeURIComponent('https://www.webtoons.com/')}` : '',
        rawCoverUrl: coverUrl,
        sourceUrl: finalUrl,
        seriesSlug: effectiveTitleNo || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      },
      totalChapters: chapters.length,
      chapters,
    };
  },
};
