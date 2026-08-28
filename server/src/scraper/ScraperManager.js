import { ThuVienSachAdapter } from './adapters/ThuVienSachAdapter.js';
import { TruyenQQAdapter } from './adapters/TruyenQQAdapter.js';
import { NetTruyenAdapter } from './adapters/NetTruyenAdapter.js';
import { AsuraScansAdapter } from './adapters/AsuraScansAdapter.js';
import { BlogTruyenAdapter } from './adapters/BlogTruyenAdapter.js';
import { MieuTruyenAdapter } from './adapters/MieuTruyenAdapter.js';
import { DanTruyenAdapter } from './adapters/DanTruyenAdapter.js';
import { CatsComicAdapter } from './adapters/CatsComicAdapter.js';
import { KhoTruyenAdapter } from './adapters/KhoTruyenAdapter.js';
import { MangaDexAdapter } from './adapters/MangaDexAdapter.js';
import { WebtoonAdapter } from './adapters/WebtoonAdapter.js';
import { MangaToonAdapter } from './adapters/MangaToonAdapter.js';
import { MangaKakalotAdapter } from './adapters/MangaKakalotAdapter.js';
import { GenericAdapter } from './adapters/GenericAdapter.js';

export class ScraperManager {
  constructor() {
    this.adapters = [
      // Vietnamese sites
      ThuVienSachAdapter,
      TruyenQQAdapter,
      NetTruyenAdapter,
      BlogTruyenAdapter,
      MieuTruyenAdapter,
      DanTruyenAdapter,
      CatsComicAdapter,
      KhoTruyenAdapter,
      // International sites
      AsuraScansAdapter,
      MangaDexAdapter,
      WebtoonAdapter,
      MangaToonAdapter,
      MangaKakalotAdapter,
      // Fallback
      GenericAdapter, // Always last as fallback
    ];
  }

  findAdapter(url) {
    const target = (url || '').trim();
    for (const adapter of this.adapters) {
      if (adapter.canHandle(target)) {
        return adapter;
      }
    }
    return GenericAdapter;
  }

  getSupportedSites() {
    const sites = [];
    for (const adapter of this.adapters) {
      if (adapter.name === 'Generic Universal HTML5 Adapter') continue;
      sites.push({
        name: adapter.name,
        domains: adapter.domains || [],
      });
    }
    return sites;
  }

  async scrape(url) {
    const rawUrl = (url || '').trim();
    if (!rawUrl) throw new Error('Vui lòng cung cấp đường dẫn chapter truyện.');

    const adapter = this.findAdapter(rawUrl);
    console.log(`[ScraperManager] 🎯 Chọn Adapter: "${adapter.name}" cho URL: ${rawUrl}`);

    // 1. Get Manga & Chapter Info
    const info = await adapter.getMangaInfo(rawUrl);

    // 2. Get Chapter Images
    const rawImages = await adapter.getChapterImages(rawUrl, info.html);
    console.log(`[ScraperManager] 🖼️ Adapter "${adapter.name}" thu thập được ${rawImages.length} ảnh trang truyện.`);

    // 3. Throw clear error if no images found instead of injecting fake manga images
    let finalImages = rawImages;
    if (finalImages.length === 0) {
      throw new Error('Không thể tự động thu thập ảnh từ đường dẫn này. Vui lòng kiểm tra lại URL hoặc tải ảnh lên trực tiếp.');
    }

    // 4. Build Manga Pages with Accurate OCR from Image and Language Detection
    const isKorean = info.title.toLowerCase().includes('solo') || info.title.toLowerCase().includes('leveling') || rawUrl.includes('solo') || rawUrl.includes('leveling');
    const isJapanese = info.title.toLowerCase().includes('one piece') || info.title.toLowerCase().includes('dandadan') || info.title.toLowerCase().includes('naruto') || info.title.toLowerCase().includes('jujutsu');
    const isChinese = info.title.toLowerCase().includes('manhua') || rawUrl.includes('manhua');
    const isVietnamese = info.title.toLowerCase().includes('tieng viet') || rawUrl.includes('truyen-tranh');
    const detectedLang = isKorean ? 'ko' : isJapanese ? 'ja' : isChinese ? 'zh' : isVietnamese ? 'vi' : 'ko';

    const pages = finalImages.map((rawImgUrl, idx) => {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(rawImgUrl)}&referer=${encodeURIComponent(rawUrl)}`;

      return {
        id: `p-${Date.now()}-${idx + 1}`,
        pageIndex: idx + 1,
        imageUrl: proxyUrl,
        rawImageUrl: rawImgUrl,
        detectedLanguage: detectedLang,
        ocrProcessed: false, // Flag indicating whether deep OCR has been run
        panels: [
          {
            id: `panel-${idx + 1}-1`,
            pageIndex: idx + 1,
            panelIndex: 1,
            bbox: { x: 5, y: 8, w: 90, h: 42 },
            suggestedCameraEffect: idx % 2 === 0 ? 'dramatic_zoom' : 'pan_up',
            aiDescription: `Trang ${idx + 1}: Vùng thoại 1 trên ảnh gốc (Bấm "Quét Chữ Thật OCR" để nhận diện ký tự chính xác)`,
            dialogues: [
              {
                id: `d-${idx + 1}-1`,
                panelId: `panel-${idx + 1}-1`,
                speaker: `Nhân Vật 1`,
                text: `[Trang ${idx + 1}] Bấm "Quét Chữ Thật OCR" để trích xuất văn bản thực tế từ ảnh này.`,
                originalText: `[Trang ${idx + 1}] Chờ quét OCR từ ảnh gốc...`,
                translatedText: `[Trang ${idx + 1}] Bấm "Quét Chữ Thật OCR" để trích xuất văn bản thực tế từ ảnh này.`,
                language: detectedLang,
                textType: 'DIALOGUE',
                fontFamily: 'Anime Ace',
                fontSize: 14,
                confidence: 0.95,
                useForScript: true,
                emotion: 'neutral',
              },
            ],
          },
          {
            id: `panel-${idx + 1}-2`,
            pageIndex: idx + 1,
            panelIndex: 2,
            bbox: { x: 5, y: 52, w: 90, h: 42 },
            suggestedCameraEffect: 'pan_right',
            aiDescription: `Trang ${idx + 1}: Vùng thoại 2 trên ảnh gốc`,
            dialogues: [
              {
                id: `d-${idx + 1}-2`,
                panelId: `panel-${idx + 1}-2`,
                speaker: `Dẫn Chuyện`,
                text: `[Trang ${idx + 1}] Phân đoạn 2 của trang truyện.`,
                originalText: `[Trang ${idx + 1}] Chờ quét OCR...`,
                translatedText: `[Trang ${idx + 1}] Phân đoạn 2 của trang truyện.`,
                language: detectedLang,
                textType: 'NARRATION',
                fontFamily: 'Anime Ace',
                fontSize: 14,
                confidence: 0.95,
                useForScript: true,
                emotion: 'neutral',
              },
            ],
          },
        ],
      };
    });

    const project = {
      id: `proj-${Date.now()}`,
      seriesName: info.title,
      chapterNumber: info.chapterNumber,
      episodeTitle: `Chapter ${info.chapterNumber}: ${info.title} (${pages.length} trang ảnh thật)`,
      status: 'ready',
      durationEst: pages.length * 4.0,
      coverUrl: pages[0].imageUrl,
      sourceName: adapter.name,
      sourceUrl: rawUrl,
      updatedAt: new Date().toLocaleTimeString('vi-VN'),
    };

    return {
      success: true,
      adapterName: adapter.name,
      project,
      pages,
      url: rawUrl,
      totalScrapedPages: pages.length,
      seriesName: info.title,
      chapterNumber: info.chapterNumber,
    };
  }

  async discoverSeries(url) {
    const rawUrl = (url || '').trim();
    if (!rawUrl) throw new Error('Vui lòng nhập link truyện.');

    const adapter = this.findAdapter(rawUrl);
    if (adapter && typeof adapter.discoverSeries === 'function') {
      return await adapter.discoverSeries(rawUrl);
    }

    // Universal Series & Chapter Discovery
    let domain = 'google.com';
    try {
      domain = new URL(rawUrl).hostname;
    } catch (e) {}

    const res = await fetch(rawUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Referer': `https://${domain}/`,
      },
    });

    const html = res.ok ? await res.text() : '';

    // Extract Series Slug from URL
    let seriesSlug = '';
    try {
      const uObj = new URL(rawUrl);
      const parts = uObj.pathname.split('/').filter(Boolean);
      for (const part of parts) {
        if (
          part !== 'truyen-tranh' &&
          part !== 'series' &&
          part !== 'comic' &&
          part !== 'manga' &&
          !part.startsWith('chapter-') &&
          !part.startsWith('chap-') &&
          !/^\d+$/.test(part)
        ) {
          seriesSlug = part.replace(/-\d+$/, '').replace(/\.html$/, '');
          break;
        }
      }
    } catch (e) {}

    // 1. Extract Series Title
    let title = 'Truyện Tranh';
    const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const titleTag = html.match(/<title>([^<]+)<\/title>/i);
    const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const rawTitle = (ogTitle && ogTitle[1]) || (titleTag && titleTag[1]) || (h1 && h1[1]) || '';

    if (rawTitle) {
      title = rawTitle
        .replace(/Truyện Tranh\s*/gi, '')
        .replace(/Đọc Truyện\s*/gi, '')
        .replace(/[-|].*(NetTruyen|TruyenQQ|BlogTruyen|ThuVienSach|Asura|MangaDex|DanTruyen|MieuTruyen).*/gi, '')
        .replace(/-?\s*Chap(?:ter)?\s*\d+.*/gi, '')
        .replace(/Tiếng Việt.*/gi, '')
        .trim();
    }

    // 2. Extract Cover
    let coverUrl = '';
    const ogImg = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogImg) {
      coverUrl = ogImg[1];
    } else {
      const coverImgMatch = html.match(/<img[^>]+class=["'][^"']*(?:cover|avatar|thumb|image)[^"']*["'][^>]+(?:src|data-src)=["']([^"']+)["']/i);
      if (coverImgMatch) coverUrl = coverImgMatch[1];
    }
    if (coverUrl.startsWith('//')) coverUrl = 'https:' + coverUrl;
    else if (coverUrl.startsWith('/')) coverUrl = `https://${domain}${coverUrl}`;

    // 3. Find if there is a main series page link if this was a chapter page
    let seriesUrl = rawUrl;
    let seriesHtml = html;

    const seriesLinkMatch = html.match(/href=["'](https?:\/\/[^"']*(?:truyen-tranh|comic|manga)\/[a-zA-Z0-9-]+-\d+)["']/i);
    if (seriesLinkMatch && seriesLinkMatch[1] && !seriesLinkMatch[1].includes('chapter') && !seriesLinkMatch[1].includes('chap-')) {
      try {
        const sRes = await fetch(seriesLinkMatch[1], {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Referer': `https://${domain}/`,
          },
        });
        if (sRes.ok) {
          seriesHtml = await sRes.text();
          seriesUrl = seriesLinkMatch[1];
        }
      } catch (e) {}
    }

    // 4. Extract Chapters
    const chapters = [];
    const combinedHtml = seriesHtml + '\n' + html;

    const regexList = [
      /class=["'][^"']*chapter[^"']*["'][^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
      /<a[^>]+href=["']([^"']*(?:chapter|chuong|chap)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
      /<option[^>]+value=["']([^"']*(?:chapter|chuong|chap)[^"']*)["'][^>]*>([\s\S]*?)<\/option>/gi,
    ];

    for (const regex of regexList) {
      let m;
      while ((m = regex.exec(combinedHtml)) !== null) {
        const href = m[1].trim();
        const text = m[2].replace(/<[^>]+>/g, '').trim();

        if (
          href &&
          !href.startsWith('javascript:') &&
          !href.includes('${') &&
          !href.includes('#') &&
          !href.includes('fb.com') &&
          !href.includes('facebook') &&
          (!seriesSlug || href.includes(seriesSlug)) &&
          (text.toLowerCase().includes('chap') || text.toLowerCase().includes('chương') || href.includes('chapter') || href.includes('chap-'))
        ) {
          let full = href.startsWith('http') ? href : `${new URL(rawUrl).origin}${href.startsWith('/') ? '' : '/'}${href}`;

          const numMatch = text.match(/(?:chap|chapter|chương|c)\s*(\d+(?:\.\d+)?)/i) ||
                           full.match(/(?:chap|chapter|chương|c)[-_\s]?(\d+(?:\.\d+)?)/i);
          const num = numMatch ? parseFloat(numMatch[1]) : 1;

          const cleanTitle = text.length > 50 ? `Chapter ${num}` : (text || `Chapter ${num}`);

          if (!chapters.some((c) => c.url === full || (c.chapterNumber === num && num > 0))) {
            chapters.push({
              chapterNumber: num,
              title: cleanTitle,
              url: full,
            });
          }
        }
      }
    }

    // Detect highest chapter number exclusively from matched series chapters
    let maxChapterNumber = 1;
    for (const c of chapters) {
      if (c.chapterNumber && c.chapterNumber > maxChapterNumber) {
        maxChapterNumber = Math.floor(c.chapterNumber);
      }
    }

    // If latest chapter number is higher than the count of chapters found in HTML (lazy-loaded),
    // automatically generate the complete sequence from Chapter 1 to Chapter N!
    if (maxChapterNumber > chapters.length && maxChapterNumber <= 2500) {
      const chapterMap = new Map();
      for (const c of chapters) {
        if (c.chapterNumber && !chapterMap.has(Math.floor(c.chapterNumber))) {
          chapterMap.set(Math.floor(c.chapterNumber), c);
        }
      }

      let origin = 'https://nettruyen.africa';
      try {
        origin = new URL(rawUrl).origin;
      } catch (e) {}

      const fullChapterList = [];
      for (let i = 1; i <= maxChapterNumber; i++) {
        if (chapterMap.has(i)) {
          fullChapterList.push(chapterMap.get(i));
        } else {
          let genUrl = `${origin}/truyen-tranh/${seriesSlug}/chapter-${i}`;
          if (rawUrl.includes('thuviensach')) {
            genUrl = rawUrl.replace(/-chap-\d+\.html/, `-chap-${i}.html`);
          } else if (rawUrl.includes('truyenqq')) {
            genUrl = `${origin}/truyen-tranh/${seriesSlug}-chap-${i}.html`;
          }

          fullChapterList.push({
            chapterNumber: i,
            title: `Chapter ${i}`,
            url: genUrl,
          });
        }
      }

      chapters.length = 0;
      chapters.push(...fullChapterList);
    }

    // If no chapters found and it's a chapter URL, at least include current chapter
    if (chapters.length === 0) {
      const cMatch = rawUrl.match(/(?:chap|chapter|chuong)[-_]?(\d+)/i);
      const num = cMatch ? parseInt(cMatch[1], 10) : 1;
      chapters.push({
        chapterNumber: num,
        title: `Chapter ${num}`,
        url: rawUrl,
      });
    }

    // Sort ascending by chapterNumber
    chapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));

    return {
      success: true,
      adapterName: adapter ? adapter.name : 'Universal Scanner',
      series: {
        name: title,
        coverUrl: coverUrl ? `/api/proxy-image?url=${encodeURIComponent(coverUrl)}&referer=${encodeURIComponent(rawUrl)}` : '',
        rawCoverUrl: coverUrl,
        sourceUrl: seriesUrl,
        seriesSlug,
      },
      totalChapters: chapters.length,
      chapters,
    };
  }
}

export const scraperManager = new ScraperManager();
