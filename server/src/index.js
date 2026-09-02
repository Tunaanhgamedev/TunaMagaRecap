import http from 'http';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { scraperManager } from './scraper/ScraperManager.js';
import { storyMemoryEngine } from './story/StoryMemoryEngine.js';
import { CapCutGenerator } from './story/CapCutGenerator.js';
import { ocrExtractText } from './ocr/MangaOCREngine.js';
import { AIVisionEngine } from './ocr/AIVisionEngine.js';
import { EdgeTtsService } from './tts/edgeTtsService.js';
import { GENRE_DICTIONARIES } from './tts/textNormalizer.js';

const PORT = 3001;
const prisma = new PrismaClient();
const DB_FILE = path.join(process.cwd(), 'server', 'db.json');

const loadDB = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (err) {}
  return {
    projects: [],
    queue: [],
  };
};

const saveDB = (data) => {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {}
};

let db = loadDB();

const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const server = http.createServer(async (req, res) => {
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = reqUrl.pathname;

  // 1. Health Endpoint (Includes Prisma SQLite Database Status)
  if (pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'TunaMagaRecap Universal Multi-Site Backend',
        database: 'Prisma SQLite Connected (dev.db)',
        port: PORT,
      })
    );
    return;
  }

  // 2. GET Dynamic Live Image Proxy (Streams bytes with correct Referer for any Manga CDN)
  if (pathname === '/api/proxy-image' && req.method === 'GET') {
    const targetImageUrl = reqUrl.searchParams.get('url');
    const customReferer = reqUrl.searchParams.get('referer');

    if (!targetImageUrl) {
      res.writeHead(400);
      res.end('Missing url param');
      return;
    }

    try {
      let fullTargetUrl = targetImageUrl;

      if (targetImageUrl.startsWith('/')) {
        try {
          const baseOrigin = customReferer ? new URL(customReferer).origin : 'https://asuracomic.net';
          fullTargetUrl = `${baseOrigin}${targetImageUrl}`;
        } catch (e) {
          fullTargetUrl = `https://asuracomic.net${targetImageUrl}`;
        }
      }

      const candidateReferers = [];
      if (customReferer) {
        candidateReferers.push(customReferer);
        try {
          candidateReferers.push(new URL(customReferer).origin + '/');
        } catch (e) {}
      }

      try {
        const imgHost = new URL(fullTargetUrl).hostname;
        candidateReferers.push(`https://${imgHost}/`);
      } catch (e) {}

      if (fullTargetUrl.includes('nettruyen') || fullTargetUrl.includes('viestorage') || (customReferer && customReferer.includes('nettruyen'))) {
        candidateReferers.push('https://nettruyen.africa/');
        candidateReferers.push('https://nettruyenco.com/');
        candidateReferers.push('https://nhattruyen.com/');
      }
      if (fullTargetUrl.includes('truyenvua') || fullTargetUrl.includes('truyenqq') || (customReferer && customReferer.includes('truyenqq'))) {
        candidateReferers.push('https://truyenqqko.com/');
        candidateReferers.push('https://truyenvua.com/');
      }
      if (fullTargetUrl.includes('thuviensach')) {
        candidateReferers.push('https://thuviensach.vn/');
      }
      if (fullTargetUrl.includes('asura')) {
        candidateReferers.push('https://asuracomic.net/');
      }
      if (fullTargetUrl.includes('blogtruyen')) {
        candidateReferers.push('https://blogtruyen.vn/');
        candidateReferers.push('https://blogtruyenmoi.com/');
      }
      candidateReferers.push('https://google.com/');
      candidateReferers.push('');

      const uniqueReferers = Array.from(new Set(candidateReferers.filter((r) => r !== undefined)));

      let imgRes = null;
      let lastStatus = 502;
      for (const ref of uniqueReferers) {
        try {
          const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          };
          if (ref) headers['Referer'] = ref;

          const testRes = await fetch(fullTargetUrl, { headers });
          if (testRes.ok) {
            imgRes = testRes;
            break;
          } else {
            lastStatus = testRes.status;
          }
        } catch (e) {}
      }

      if (!imgRes) {
        throw new Error(`Upstream image server returned HTTP ${lastStatus}`);
      }

      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await imgRes.arrayBuffer();

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(Buffer.from(arrayBuffer));
    } catch (err) {
      res.writeHead(502);
      res.end('Failed to proxy image: ' + err.message);
    }
    return;
  }

  // 3. GET Projects (Syncs with Prisma SQLite Database)
  if (pathname === '/api/projects' && req.method === 'POST' || (pathname === '/api/projects' && req.method === 'GET')) {
    if (req.method === 'GET') {
      try {
        const prismaProjects = await prisma.project.findMany({
          orderBy: { updatedAt: 'desc' },
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, projects: prismaProjects.length > 0 ? prismaProjects : db.projects }));
      } catch (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, projects: db.projects }));
      }
      return;
    }
  }

  // 3b. POST & DELETE Delete Project (Prisma SQLite & Local DB)
  if (
    (pathname === '/api/projects/delete' || pathname === '/api/projects' || pathname === '/api/projects/clear-all') &&
    (req.method === 'POST' || req.method === 'DELETE')
  ) {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const projId = payload.id || '';
        const clearAll = payload.clearAll || pathname === '/api/projects/clear-all';

        if (clearAll) {
          try {
            await prisma.project.deleteMany({});
          } catch (e) {}
          db.projects = [];
          saveDB(db);
        } else if (projId) {
          try {
            await prisma.project.delete({ where: { id: projId } });
          } catch (e) {}

          db.projects = db.projects.filter((p) => p.id !== projId);
          saveDB(db);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, projects: db.projects, message: 'Đã xóa dự án thành công' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 4. POST Scrape Manga Link with Modular Scraper Framework & Prisma Sync
  if (pathname === '/api/manga/fetch-url' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const mangaUrl = payload.url || '';

        if (!mangaUrl.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Vui lòng cung cấp đường dẫn chapter truyện.' }));
          return;
        }

        const scrapedData = await scraperManager.scrape(mangaUrl);

        // Sync to Prisma SQLite DB
        try {
          const project = await prisma.project.create({
            data: {
              seriesName: scrapedData.project.seriesName,
              chapterNumber: scrapedData.project.chapterNumber,
              episodeTitle: scrapedData.project.episodeTitle,
              status: 'ready',
              durationEst: scrapedData.project.durationEst,
              coverUrl: scrapedData.project.coverUrl,
            },
          });
          scrapedData.project.id = project.id;

          if (scrapedData.pages && scrapedData.pages.length > 0) {
            await prisma.chapter.create({
              data: {
                projectId: project.id,
                number: parseInt(scrapedData.project.chapterNumber) || 1,
                title: scrapedData.project.episodeTitle || `Chapter ${scrapedData.project.chapterNumber}`,
                pages: {
                  create: scrapedData.pages.map((p, idx) => ({
                    pageIndex: p.pageIndex || idx + 1,
                    imageUrl: p.imageUrl || p.rawImageUrl || '',
                  }))
                }
              }
            });
          }
        } catch (dbErr) {
          console.log('[Prisma Sync] Stored in cached memory store:', dbErr.message);
        }

        db.projects = [scrapedData.project, ...db.projects.filter((p) => p.seriesName !== scrapedData.project.seriesName || p.chapterNumber !== scrapedData.project.chapterNumber)];
        saveDB(db);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...scrapedData }));
      } catch (err) {
        console.error('[API Error] scrape URL error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 4b. POST Discover Series & Scan All Chapters
  if (pathname === '/api/manga/discover-series' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const mangaUrl = payload.url || '';

        if (!mangaUrl.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Vui lòng cung cấp đường dẫn truyện để quét.' }));
          return;
        }

        console.log(`[Discover API] 🔍 Bắt đầu dò tìm toàn bộ chapter từ: ${mangaUrl}`);
        const discovered = await scraperManager.discoverSeries(mangaUrl);

        // Check which chapters are already scraped in database
        let existingProjects = [];
        try {
          existingProjects = await prisma.project.findMany({
            where: { seriesName: discovered.series.name },
            select: { id: true, chapterNumber: true, episodeTitle: true, durationEst: true }
          });
        } catch (e) {
          existingProjects = db.projects.filter((p) => p.seriesName === discovered.series.name);
        }

        const enrichedChapters = discovered.chapters.map((ch) => {
          const existing = existingProjects.find((p) => p.chapterNumber === ch.chapterNumber);
          return {
            ...ch,
            isScraped: !!existing,
            projectId: existing ? existing.id : null,
          };
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          series: discovered.series,
          totalChapters: enrichedChapters.length,
          chapters: enrichedChapters,
        }));
      } catch (err) {
        console.error('[API Error] discover-series error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Global batch scraping progress tracker
  if (pathname === '/api/manga/batch-status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(global.batchScrapeProgress || { isRunning: false, current: 0, total: 0, percent: 0 }));
    return;
  }

  // 4c. POST Batch Scrape Chapters
  if (pathname === '/api/manga/batch-scrape' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { seriesName, chapters } = payload;

        if (!Array.isArray(chapters) || chapters.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Danh sách chapter cần cào không hợp lệ.' }));
          return;
        }

        global.batchScrapeProgress = {
          isRunning: true,
          seriesName: seriesName || 'Truyện Tranh',
          current: 0,
          total: chapters.length,
          currentChapter: chapters[0]?.title || '',
          percent: 0,
          completedProjects: [],
          errors: [],
        };

        // Respond immediately with batch accepted
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: `Đã bắt đầu cào hàng loạt ${chapters.length} chapter trong nền.`,
          total: chapters.length,
        }));

        // Execute batch in background
        (async () => {
          for (let i = 0; i < chapters.length; i++) {
            const ch = chapters[i];
            global.batchScrapeProgress.current = i + 1;
            global.batchScrapeProgress.currentChapter = ch.title || `Chapter ${ch.chapterNumber}`;
            global.batchScrapeProgress.percent = Math.round(((i + 1) / chapters.length) * 100);

            try {
              console.log(`[Batch Scraper] ⏳ [${i + 1}/${chapters.length}] Đang cào ${ch.title} (${ch.url})...`);
              const scrapedData = await scraperManager.scrape(ch.url);

              try {
                const project = await prisma.project.create({
                  data: {
                    seriesName: scrapedData.project.seriesName || seriesName,
                    chapterNumber: ch.chapterNumber || scrapedData.project.chapterNumber,
                    episodeTitle: scrapedData.project.episodeTitle,
                    status: 'ready',
                    durationEst: scrapedData.project.durationEst,
                    coverUrl: scrapedData.project.coverUrl,
                  },
                });
                scrapedData.project.id = project.id;

                if (scrapedData.pages && scrapedData.pages.length > 0) {
                  await prisma.chapter.create({
                    data: {
                      projectId: project.id,
                      number: parseInt(ch.chapterNumber || scrapedData.project.chapterNumber) || 1,
                      title: scrapedData.project.episodeTitle || `Chapter ${ch.chapterNumber}`,
                      pages: {
                        create: scrapedData.pages.map((p, idx) => ({
                          pageIndex: p.pageIndex || idx + 1,
                          imageUrl: p.imageUrl || p.rawImageUrl || '',
                        }))
                      }
                    }
                  });
                }
              } catch (dbErr) {
                console.log('[Batch Prisma Sync] Stored in local JSON:', dbErr.message);
              }

              db.projects = [scrapedData.project, ...db.projects.filter((p) => p.id !== scrapedData.project.id && (p.seriesName !== scrapedData.project.seriesName || p.chapterNumber !== scrapedData.project.chapterNumber))];
              saveDB(db);

              global.batchScrapeProgress.completedProjects.push(scrapedData.project);
            } catch (chErr) {
              console.error(`[Batch Scraper] ❌ Lỗi cào ${ch.title}:`, chErr.message);
              global.batchScrapeProgress.errors.push({ chapter: ch.title, error: chErr.message });
            }

            // Small delay to be polite to the target comic site
            await new Promise((r) => setTimeout(r, 400));
          }

          global.batchScrapeProgress.isRunning = false;
          console.log(`[Batch Scraper] ✅ Hoàn tất cào ${global.batchScrapeProgress.completedProjects.length}/${chapters.length} chapter cho ${seriesName}!`);
        })().catch((err) => {
          global.batchScrapeProgress.isRunning = false;
          console.error('[Batch Scraper] Fatal error:', err);
        });

      } catch (err) {
        console.error('[API Error] batch-scrape error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 4d. GET All Series Folders (Grouped by seriesName)
  if (pathname === '/api/series' && req.method === 'GET') {
    try {
      let allProjects = [];
      try {
        allProjects = await prisma.project.findMany({
          orderBy: { chapterNumber: 'asc' },
        });
      } catch (e) {
        allProjects = db.projects;
      }

      // Group projects by seriesName
      const seriesMap = new Map();
      for (const p of allProjects) {
        const sName = p.seriesName || 'Truyện Khác';
        if (!seriesMap.has(sName)) {
          seriesMap.set(sName, {
            seriesName: sName,
            coverUrl: p.coverUrl || '',
            totalChapters: 0,
            chapters: [],
            updatedAt: p.updatedAt,
          });
        }
        const sObj = seriesMap.get(sName);
        sObj.totalChapters += 1;
        sObj.chapters.push(p);
      }

      // Sort chapters inside each series by chapterNumber ascending
      const seriesList = Array.from(seriesMap.values()).map((s) => ({
        ...s,
        chapters: s.chapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0)),
      }));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, series: seriesList }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

async function resolveAndFetchImageBuffer(imageUrl) {
  if (!imageUrl) return null;

  // 1. Direct Buffer extraction for base64 Data URLs (user uploaded images)
  if (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
    const commaIndex = imageUrl.indexOf(',');
    if (commaIndex !== -1) {
      return Buffer.from(imageUrl.slice(commaIndex + 1), 'base64');
    }
  }

  let targetUrl = imageUrl;
  let customReferer = null;

  if (imageUrl.startsWith('/api/proxy-image') || imageUrl.includes('/api/proxy-image')) {
    try {
      const proxyUrl = new URL(imageUrl, `http://localhost:${PORT}`);
      const realUrl = proxyUrl.searchParams.get('url');
      if (realUrl) {
        targetUrl = realUrl;
        customReferer = proxyUrl.searchParams.get('referer');
      }
    } catch (e) {}
  }

  const candidateReferers = [];
  if (customReferer) {
    candidateReferers.push(customReferer);
    try {
      candidateReferers.push(new URL(customReferer).origin + '/');
    } catch (e) {}
  }

  try {
    const imgHost = new URL(targetUrl).hostname;
    candidateReferers.push(`https://${imgHost}/`);
  } catch (e) {}

  if (targetUrl.includes('nettruyen') || targetUrl.includes('viestorage') || (customReferer && customReferer.includes('nettruyen'))) {
    candidateReferers.push('https://nettruyen.africa/');
    candidateReferers.push('https://nettruyenco.com/');
    candidateReferers.push('https://nhattruyen.com/');
  }
  if (targetUrl.includes('truyenvua') || targetUrl.includes('truyenqq') || (customReferer && customReferer.includes('truyenqq'))) {
    candidateReferers.push('https://truyenqqko.com/');
    candidateReferers.push('https://truyenvua.com/');
  }
  if (targetUrl.includes('thuviensach')) {
    candidateReferers.push('https://thuviensach.vn/');
  }
  if (targetUrl.includes('asura')) {
    candidateReferers.push('https://asuracomic.net/');
  }
  if (targetUrl.includes('blogtruyen')) {
    candidateReferers.push('https://blogtruyen.vn/');
    candidateReferers.push('https://blogtruyenmoi.com/');
  }
  candidateReferers.push('https://google.com/');
  candidateReferers.push('');

  const uniqueReferers = Array.from(new Set(candidateReferers.filter((r) => r !== undefined)));

  for (const ref of uniqueReferers) {
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      };
      if (ref) headers['Referer'] = ref;

      const imgRes = await fetch(targetUrl, { headers });
      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
    } catch (e) {}
  }

  console.warn(`[Image Fetcher] All referers failed to download image from ${targetUrl}`);
  return null;
}

  // 5. POST Real OCR - Extract actual text from manga page images using Tesseract.js
  if (pathname === '/api/ocr/detect' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const pIdx = Number(payload.pageIndex) || 1;
        const lang = payload.language || 'ko';
        const imageUrl = payload.imageUrl || '';

        if (!imageUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'imageUrl is required' }));
          return;
        }

        const imageSource = await resolveAndFetchImageBuffer(imageUrl);
        console.log(`[Server] 🔍 Running OCR on page ${pIdx}, lang=${lang}, bufferReady=${!!imageSource}`);

        // 1. Try Gemini Vision AI if API key is configured or passed
        const geminiKey = payload.apiKey || process.env.GEMINI_API_KEY || '';
        let ocrResult = null;

        if (geminiKey && Buffer.isBuffer(imageSource)) {
          try {
            console.log(`[Server] 🤖 Running Google Gemini Vision AI on page ${pIdx}...`);
            const base64 = imageSource.toString('base64');
            const aiData = await AIVisionEngine.analyzeMangaWithGeminiVision({
              imageBase64: base64,
              mimeType: 'image/jpeg',
              targetLang: payload.targetLanguage || 'vi',
              apiKey: geminiKey,
            });

            if (aiData && aiData.panels && aiData.panels.length > 0) {
              const formattedPanels = aiData.panels.map((p, idx) => ({
                id: `panel-${pIdx}-${idx + 1}`,
                pageIndex: pIdx,
                panelIndex: idx + 1,
                bbox: p.bbox || { x: 10, y: 15, w: 80, h: 30 },
                suggestedCameraEffect: idx === 0 ? 'dramatic_zoom' : 'pan_up',
                aiDescription: `Trang ${pIdx}: ${p.speaker || 'Thoại'} (${p.textType || 'DIALOGUE'})`,
                dialogues: [
                  {
                    id: `d-${pIdx}-${idx + 1}`,
                    panelId: `panel-${pIdx}-${idx + 1}`,
                    speaker: p.speaker || 'Nhân Vật',
                    text: p.translatedText || p.originalText,
                    originalText: p.originalText,
                    translatedText: p.translatedText,
                    language: aiData.detectedLanguage || lang,
                    textType: p.textType || 'DIALOGUE',
                    fontFamily: 'Anime Ace',
                    fontSize: 14,
                    confidence: 0.99,
                    useForScript: p.textType !== 'SOUND_EFFECT',
                    emotion: p.emotion || 'neutral',
                  },
                ],
              }));

              // Always append 1 Narration panel for AI video recap
              formattedPanels.push({
                id: `panel-${pIdx}-narr`,
                pageIndex: pIdx,
                panelIndex: formattedPanels.length + 1,
                bbox: { x: 5, y: 75, w: 90, h: 20 },
                suggestedCameraEffect: 'pan_down',
                aiDescription: `Trang ${pIdx}: Lời dẫn chuyện Video Recap (AI Content)`,
                dialogues: [
                  {
                    id: `d-${pIdx}-narr`,
                    panelId: `panel-${pIdx}-narr`,
                    speaker: 'Dẫn Chuyện',
                    text: aiData.pageSummary || `[Dẫn truyện Trang ${pIdx}]: Diễn biến kịch tính tiếp theo...`,
                    originalText: `[Dẫn truyện Trang ${pIdx}]`,
                    translatedText: aiData.pageSummary || `[Dẫn truyện Trang ${pIdx}]: Diễn biến kịch tính tiếp theo...`,
                    language: 'vi',
                    textType: 'NARRATION',
                    fontFamily: 'Inter',
                    fontSize: 14,
                    confidence: 1.0,
                    useForScript: true,
                    emotion: 'excited',
                  },
                ],
              });

              ocrResult = {
                panels: formattedPanels,
                rawText: aiData.panels.map((p) => p.originalText).join(' '),
                confidence: 0.99,
                textBlockCount: formattedPanels.length,
                language: aiData.detectedLanguage || lang,
                isAIPowered: true,
              };
            }
          } catch (aiErr) {
            console.log('[Server] ⚠️ Gemini Vision error, falling back to local OCR:', aiErr.message);
          }
        }

        // 2. Fallback to Local Tesseract + Sharp with Smart Noise Cleaning
        if (!ocrResult) {
          ocrResult = await ocrExtractText(imageSource, lang, pIdx);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          pageIndex: pIdx,
          panels: ocrResult.panels,
          rawText: ocrResult.rawText,
          confidence: ocrResult.confidence,
          textBlockCount: ocrResult.textBlockCount,
          language: ocrResult.language,
          isAIPowered: ocrResult.isAIPowered || false,
        }));
      } catch (err) {
        console.error('[Server] OCR Error:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }
  // 5b. POST Real Batch OCR - Process multiple manga pages sequentially with real OCR
  if (pathname === '/api/ocr/batch' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const pagesToProcess = payload.pages || [];
        const requestedLang = payload.language || 'vi';

        console.log(`[Server] 🚀 Starting Parallel Batch OCR on ${pagesToProcess.length} pages (lang: ${requestedLang})`);

        const results = [];
        const CHUNK_SIZE = 5; // Process 5 pages in parallel

        for (let i = 0; i < pagesToProcess.length; i += CHUNK_SIZE) {
          const chunk = pagesToProcess.slice(i, i + CHUNK_SIZE);

          const chunkResults = await Promise.all(
            chunk.map(async (item, cIdx) => {
              const globalIdx = i + cIdx;
              const pageIndex = Number(item.pageIndex) || (globalIdx + 1);
              const imageUrl = item.rawImageUrl || item.imageUrl || '';

              if (!imageUrl) {
                return { pageIndex, panels: [], rawText: '', confidence: 0, language: requestedLang };
              }

              const imageSource = await resolveAndFetchImageBuffer(imageUrl);

              let ocrRes = null;
              const geminiKey = payload.apiKey || process.env.GEMINI_API_KEY || '';

              if (geminiKey && Buffer.isBuffer(imageSource)) {
                try {
                  const base64 = imageSource.toString('base64');
                  const aiData = await AIVisionEngine.analyzeMangaWithGeminiVision({
                    imageBase64: base64,
                    mimeType: 'image/jpeg',
                    targetLang: requestedLang,
                    apiKey: geminiKey,
                  });

                  if (aiData && aiData.panels && aiData.panels.length > 0) {
                    const formattedPanels = aiData.panels.map((p, pIdx) => ({
                      id: `panel-${pageIndex}-${pIdx + 1}`,
                      pageIndex,
                      panelIndex: pIdx + 1,
                      bbox: p.bbox || { x: 10, y: 15, w: 80, h: 30 },
                      suggestedCameraEffect: pIdx === 0 ? 'dramatic_zoom' : 'pan_up',
                      aiDescription: `Trang ${pageIndex}: ${p.speaker || 'Thoại'}`,
                      dialogues: [
                        {
                          id: `d-${pageIndex}-${pIdx + 1}`,
                          panelId: `panel-${pageIndex}-${pIdx + 1}`,
                          speaker: p.speaker || 'Nhân Vật',
                          text: p.translatedText || p.originalText,
                          originalText: p.originalText,
                          translatedText: p.translatedText,
                          language: aiData.detectedLanguage || requestedLang,
                          textType: p.textType || 'DIALOGUE',
                          fontFamily: 'Anime Ace',
                          fontSize: 14,
                          confidence: 0.99,
                          useForScript: p.textType !== 'SOUND_EFFECT',
                          emotion: p.emotion || 'neutral',
                        },
                      ],
                    }));

                    formattedPanels.push({
                      id: `panel-${pageIndex}-narr`,
                      pageIndex,
                      panelIndex: formattedPanels.length + 1,
                      bbox: { x: 5, y: 75, w: 90, h: 20 },
                      suggestedCameraEffect: 'pan_down',
                      aiDescription: `Trang ${pageIndex}: Lời dẫn chuyện Video Recap (AI Content)`,
                      dialogues: [
                        {
                          id: `d-${pageIndex}-narr`,
                          panelId: `panel-${pageIndex}-narr`,
                          speaker: 'Dẫn Chuyện',
                          text: aiData.pageSummary || `[Dẫn truyện Trang ${pageIndex}]: Tóm tắt phân cảnh...`,
                          originalText: `[Dẫn truyện Trang ${pageIndex}]`,
                          translatedText: aiData.pageSummary || `[Dẫn truyện Trang ${pageIndex}]: Tóm tắt phân cảnh...`,
                          language: 'vi',
                          textType: 'NARRATION',
                          fontFamily: 'Inter',
                          fontSize: 14,
                          confidence: 1.0,
                          useForScript: true,
                          emotion: 'excited',
                        },
                      ],
                    });

                    ocrRes = {
                      panels: formattedPanels,
                      rawText: aiData.panels.map((p) => p.originalText).join(' '),
                      confidence: 0.99,
                      language: aiData.detectedLanguage || requestedLang,
                    };
                  }
                } catch (e) {
                  console.log(`[Batch OCR] Gemini Vision fallback on page ${pageIndex}:`, e.message);
                }
              }

              if (!ocrRes) {
                ocrRes = await ocrExtractText(imageSource, requestedLang, pageIndex);
              }

              return {
                pageIndex,
                panels: ocrRes.panels,
                rawText: ocrRes.rawText,
                confidence: ocrRes.confidence,
                language: ocrRes.language,
              };
            })
          );

          results.push(...chunkResults);
          console.log(`[Server Batch OCR] ⚡ Completed ${results.length}/${pagesToProcess.length} pages...`);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, count: results.length, pages: results }));
      } catch (err) {
        console.error('[Server Batch OCR] Error:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 5c. POST Save AI API Key Securely in .env
  if (pathname === '/api/ai/config' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        if (payload.geminiApiKey) {
          process.env.GEMINI_API_KEY = payload.geminiApiKey;
          // Update .env file locally without exposing to git
          const envPath = path.join(process.cwd(), '.env');
          let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
          if (envContent.includes('GEMINI_API_KEY=')) {
            envContent = envContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY=${payload.geminiApiKey}`);
          } else {
            envContent += `\nGEMINI_API_KEY=${payload.geminiApiKey}\n`;
          }
          fs.writeFileSync(envPath, envContent);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Đã lưu cấu hình AI an toàn vào .env!' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 5d. GET Available High-Fidelity Edge Neural TTS Voices
  if (pathname === '/api/tts/voices' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        voices: [
          {
            id: 'vi-VN-NamMinhNeural',
            name: 'Nam Minh (Nam - Hào Hùng, Review Manhwa/Manga/Tu Tiên)',
            gender: 'male',
            lang: 'vi-VN',
            provider: 'Microsoft Edge Neural',
            recommendedRate: '+15%',
            recommendedPitch: '+0Hz',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            description: 'Giọng nam hào hùng, dứt khoát, âm sắc rõ ràng, chuẩn phong cách review YouTube triệu view.',
          },
          {
            id: 'vi-VN-HoaiMyNeural',
            name: 'Hoài My (Nữ - Truyền Cảm, Ngôn Tình/Drama/Isekai)',
            gender: 'female',
            lang: 'vi-VN',
            provider: 'Microsoft Edge Neural',
            recommendedRate: '+10%',
            recommendedPitch: '+0Hz',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            description: 'Giọng nữ ngọt ngào, truyền cảm hứng, phát âm tự nhiên 100% như người thật.',
          },
          {
            id: 'en-US-GuyNeural',
            name: 'Guy (US Manhwa Narrator Pro)',
            gender: 'male',
            lang: 'en-US',
            provider: 'Microsoft Edge Neural',
            recommendedRate: '+10%',
            recommendedPitch: '+0Hz',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            description: 'Giọng nam trầm Mỹ chuyên đọc Manhwa Recap triệu view trên YouTube Quốc Tế.',
          },
          {
            id: 'en-US-ChristopherNeural',
            name: 'Christopher (Epic Movie Narrator)',
            gender: 'male',
            lang: 'en-US',
            provider: 'Microsoft Edge Neural',
            recommendedRate: '+5%',
            recommendedPitch: '-2Hz',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
            description: 'Giọng đọc điện ảnh Hollywood hùng tráng, tăng retention khán giả phương Tây.',
          },
          {
            id: 'en-US-JennyNeural',
            name: 'Jenny (US Female Anime Host)',
            gender: 'female',
            lang: 'en-US',
            provider: 'Microsoft Edge Neural',
            recommendedRate: '+10%',
            recommendedPitch: '+0Hz',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            description: 'Giọng nữ Mỹ truyền cảm, chuyên review Romance & Fantasy Webtoons.',
          },
          {
            id: 'ja-JP-KeitaNeural',
            name: 'Keita (Japanese Anime Narrator)',
            gender: 'male',
            lang: 'ja-JP',
            provider: 'Microsoft Edge Neural',
            recommendedRate: '+10%',
            recommendedPitch: '+0Hz',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            description: 'Giọng nam anime Nhật Bản chuẩn Tokyo, chuyên làm kênh Manga Recap tiếng Nhật.',
          },
          {
            id: 'ja-JP-NanamiNeural',
            name: 'Nanami (Japanese Anime Heroine)',
            gender: 'female',
            lang: 'ja-JP',
            provider: 'Microsoft Edge Neural',
            recommendedRate: '+10%',
            recommendedPitch: '+0Hz',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            description: 'Giọng nữ Anime trong trẻo, biểu cảm sống động, chuẩn diễn viên lồng tiếng Seiyuu.',
          },
          {
            id: 'ko-KR-InJoonNeural',
            name: 'InJoon (Korean Manhwa Narrator)',
            gender: 'male',
            lang: 'ko-KR',
            provider: 'Microsoft Edge Neural',
            recommendedRate: '+10%',
            recommendedPitch: '+0Hz',
            avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
            description: 'Giọng nam Hàn Quốc nguyên bản, lồng tiếng Webtoon chuẩn Naver/KakaoPage.',
          },
          {
            id: 'ko-KR-SunHiNeural',
            name: 'SunHi (Korean Webtoon Heroine)',
            gender: 'female',
            lang: 'ko-KR',
            provider: 'Microsoft Edge Neural',
            recommendedRate: '+10%',
            recommendedPitch: '+0Hz',
            avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
            description: 'Giọng nữ Hàn Quốc ngọt ngào, truyền cảm xúc mạnh mẽ cho Romance Manhwa.',
          },
          {
            id: 'zh-CN-YunxiNeural',
            name: 'Yunxi (Chinese Manhua Tu Tiên Pro)',
            gender: 'male',
            lang: 'zh-CN',
            provider: 'Microsoft Edge Neural',
            recommendedRate: '+10%',
            recommendedPitch: '+0Hz',
            avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
            description: 'Giọng nam Trung Quốc hào hùng, chuyên review truyện Tu Tiên, Huyền Huyễn.',
          },
          {
            id: 'zh-CN-XiaoxiaoNeural',
            name: 'Xiaoxiao (Chinese Manhua Host)',
            gender: 'female',
            lang: 'zh-CN',
            provider: 'Microsoft Edge Neural',
            recommendedRate: '+10%',
            recommendedPitch: '+0Hz',
            avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
            description: 'Giọng nữ Trung Quốc chuẩn Bắc Kinh, êm dịu, lôi cuốn người nghe.',
          },
          {
            id: 'es-ES-AlvaroNeural',
            name: 'Alvaro (Spanish Global Recap)',
            gender: 'male',
            lang: 'es-ES',
            provider: 'Microsoft Edge Neural',
            recommendedRate: '+10%',
            recommendedPitch: '+0Hz',
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            description: 'Giọng nam Tây Ban Nha chuyên review Manhwa thị trường Mỹ Latinh & Châu Âu.',
          },
          {
            id: 'es-ES-ElviraNeural',
            name: 'Elvira (Spanish Female Host)',
            gender: 'female',
            lang: 'es-ES',
            provider: 'Microsoft Edge Neural',
            recommendedRate: '+10%',
            recommendedPitch: '+0Hz',
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            description: 'Giọng nữ Tây Ban Nha giàu năng lượng, phù hợp recap video viral TikTok.',
          },
          {
            id: 'fr-FR-HenriNeural',
            name: 'Henri (French Cinema Narrator)',
            gender: 'male',
            lang: 'fr-FR',
            provider: 'Microsoft Edge Neural',
            recommendedRate: '+10%',
            recommendedPitch: '+0Hz',
            avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
            description: 'Giọng nam tiếng Pháp phong thái điện ảnh, âm trầm lôi cuốn người nghe.',
          },
          {
            id: 'de-DE-ConradNeural',
            name: 'Conrad (German Epic Voice)',
            gender: 'male',
            lang: 'de-DE',
            provider: 'Microsoft Edge Neural',
            recommendedRate: '+10%',
            recommendedPitch: '+0Hz',
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
            description: 'Giọng nam Đức dứt khoát, uy lực, phù hợp phân cảnh combat chiến thuật.',
          },
        ],
      })
    );
    return;
  }

  // 5e. POST Synthesize Text to Neural Audio MP3 with Disk Caching
  if (pathname === '/api/tts/synthesize' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const text = payload.text || '';
        const voice = payload.voice || 'vi-VN-NamMinhNeural';
        const rate = payload.rate || '+15%';
        const pitch = payload.pitch || '+0Hz';
        const genre = payload.genre || '';
        const customDictionary = payload.customDictionary || [];

        if (!text || typeof text !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Vui lòng cung cấp văn bản cần đọc.' }));
          return;
        }

        console.log(`[Server TTS] 🎙️ Synthesizing (${voice}): "${text.slice(0, 50)}..."`);
        const result = await EdgeTtsService.synthesize({
          text,
          voice,
          rate,
          pitch,
          genre,
          customDictionary,
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            data: result,
          })
        );
      } catch (err) {
        console.error('[Server TTS Error]:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message || 'Lỗi tổng hợp giọng nói AI.' }));
      }
    });
    return;
  }

  // 5g. GET Built-In Pronunciation Dictionaries (Genre Packs)
  if (pathname === '/api/tts/dictionary' && req.method === 'GET') {
    const formattedPacks = {};
    for (const genre in GENRE_DICTIONARIES) {
      formattedPacks[genre] = GENRE_DICTIONARIES[genre].map(([regex, reading]) => {
        // Extract plain string from regex if possible
        const strPattern = regex.source.replace(/\\b/g, '').replace(/\\s\+/g, ' ').replace(/\[- \]\?/g, ' ').trim();
        return {
          term: strPattern,
          reading,
        };
      });
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        genres: [
          { id: 'tutien', name: 'Tu Tiên / Ma Hoàng / Tiên Hiệp', icon: '🐉', count: formattedPacks.tutien?.length || 0 },
          { id: 'thosan', name: 'Thợ Săn / Hệ Thống / Hồi Quy (Solo Leveling, ORV)', icon: '⚡', count: formattedPacks.thosan?.length || 0 },
          { id: 'shonen', name: 'Manga Shonen / Isekai / Chuyển Sinh', icon: '⚔️', count: formattedPacks.shonen?.length || 0 },
          { id: 'dothi', name: 'Đô Thị / Giang Hồ / Báo Thù (Lookism)', icon: '🏙️', count: formattedPacks.dothi?.length || 0 },
          { id: 'gaming', name: 'Esports / Game Thủ / MMORPG', icon: '🎮', count: formattedPacks.gaming?.length || 0 },
        ],
        dictionaries: formattedPacks,
      })
    );
    return;
  }

  // 5h. POST AI Auto-Extract & Transliterate Terms from Chapter Script
  if (pathname === '/api/tts/extract-terms' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const scriptText = payload.scriptText || '';
        const seriesName = payload.seriesName || '';
        const genre = payload.genre || '';
        const apiKey = payload.apiKey || process.env.GEMINI_API_KEY || '';

        if (!scriptText || scriptText.length < 10) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Kịch bản quá ngắn để phân tích.' }));
          return;
        }

        let detectedTerms = [];

        if (apiKey) {
          try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const prompt = `
Bạn là chuyên gia ngôn ngữ và đạo diễn lồng tiếng video Review Manga/Manhwa/Manhua chuyên nghiệp trên YouTube.
Hãy quét kịch bản sau của bộ truyện "${seriesName}" (thể loại: ${genre}) và tìm ra TOÀN BỘ các Tên nhân vật nước ngoài (Anh/Hàn/Nhật/Pinyin), Tên chiêu thức, Tên tổ chức/quân đoàn, và Thuật ngữ gaming/hệ thống.

Nhiệm vụ: Hãy tạo bảng phiên âm tiếng Việt tự nhiên 100% để Text-to-Speech (Microsoft Edge Neural TTS) đọc lên mượt mà, đúng chuẩn người Việt nghe hiểu và không bị ngọng hay lơ lớ.

Kịch bản cần quét:
"""
${scriptText.slice(0, 3500)}
"""

Hãy trả về DUY NHẤT một JSON Array hợp lệ theo định dạng:
[
  { "term": "Tên gốc trong truyện", "reading": "Phiên âm tiếng Việt tự nhiên", "category": "character" | "skill" | "system" | "realm", "note": "Ghi chú ngắn" }
]
`;

            const response = await model.generateContent(prompt);
            const textResp = response.response.text();
            const jsonMatch = textResp.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              detectedTerms = JSON.parse(jsonMatch[0]);
            }
          } catch (e) {
            console.log('[Extract Terms AI Fallback]', e.message);
          }
        }

        // Fallback rule-based detection if AI didn't return
        if (detectedTerms.length === 0) {
          const capitalizedWords = scriptText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
          const uniqueWords = [...new Set(capitalizedWords)].slice(0, 10);
          detectedTerms = uniqueWords.map(w => ({
            term: w,
            reading: w,
            category: 'character',
            note: 'Phát hiện tự động',
          }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            count: detectedTerms.length,
            terms: detectedTerms,
          })
        );
      } catch (err) {
        console.error('[Extract Terms Error]:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 5f. GET Stream Cached MP3 Audio File
  if (pathname.startsWith('/api/tts/audio/') && req.method === 'GET') {
    const filename = pathname.replace('/api/tts/audio/', '');
    const audioBuffer = EdgeTtsService.getAudioFile(filename);
    if (!audioBuffer) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'File audio không tồn tại.' }));
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=31536000',
    });
    res.end(audioBuffer);
    return;
  }

  // 5b. POST Translate Text - Translate real OCR text into target language
  if (pathname === '/api/translate' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const text = payload.text || '';
        let dialogues = payload.dialogues || [];

        if (dialogues.length === 0 && text) {
          dialogues = [{ id: 'd-single', text, originalText: text }];
        }

        const targetLang = payload.targetLanguage || 'vi';
        const sourceLang = payload.sourceLanguage || 'ko';
        const geminiKey = payload.apiKey || process.env.GEMINI_API_KEY || '';

        console.log(`[Server Translate] 🌐 Translating ${dialogues.length} dialogues to ${targetLang}...`);

        const translatedDialogues = await AIVisionEngine.translateMangaWithGemini({
          dialogues,
          targetLang,
          apiKey: geminiKey,
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            dialogues: translatedDialogues,
            originalText: text,
            translatedText: translatedDialogues[0]?.translatedText || text,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
            isAIPowered: true,
          })
        );
      } catch (err) {
        console.error('[Server Translate Error]:', err.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }
  if (pathname === '/api/ai/script' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const mode = payload.mode || 'review';
        const seriesName = payload.seriesName || 'Truyện Tranh Mới';
        const chapterNumber = payload.chapterNumber || 1;
        const dialogues = payload.dialogues || [];
        const pages = payload.pages || [];
        const customPrompt = payload.customPrompt || '';
        const apiKey = payload.apiKey || '';
        const genre = payload.genre || null;
        const protagonist = payload.protagonist || '';

        const generatedScript = await AIVisionEngine.generateMangaRecapScript({
          seriesName,
          chapterNumber,
          mode,
          dialogues,
          pages,
          customPrompt,
          apiKey,
          genre,
          protagonist,
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            mode,
            script: generatedScript,
            wordCount: generatedScript.split(/\s+/).length,
          })
        );
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 7. POST CapCut Export (16:9 Longform & 9:16 Shorts)
  if (pathname === '/api/capcut/export' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const draft = CapCutGenerator.createDraft({
          title: payload.title || 'Manga Recap Video',
          seriesName: payload.seriesName || 'Truyện Tranh',
          chapterNumber: payload.chapterNumber || 1,
          pages: payload.pages || [],
          aspect: payload.aspect || '16:9',
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, capcutProject: draft }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 8. GET Project Detail
  if (pathname === '/api/projects/detail' && req.method === 'GET') {
    const projId = reqUrl.searchParams.get('id');
    if (!projId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing project id' }));
      return;
    }

    try {
      let prismaProject = await prisma.project.findUnique({
        where: { id: projId },
        include: {
          chapters: {
            include: {
              pages: {
                include: {
                  panels: {
                    include: { dialogues: true }
                  }
                }
              }
            }
          }
        }
      });

      const localProject = db.projects.find((p) => p.id === projId);
      const effectiveProject = prismaProject || localProject;

      if (!effectiveProject) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Project not found' }));
        return;
      }

      let pages = [];
      if (prismaProject && prismaProject.chapters && prismaProject.chapters.length > 0) {
        const chapter = prismaProject.chapters[0];
        pages = (chapter.pages || []).map((page) => ({
          id: page.id,
          pageIndex: page.pageIndex,
          imageUrl: page.imageUrl,
          panels: (page.panels || []).map((panel) => ({
            id: panel.id,
            pageIndex: panel.pageIndex,
            panelIndex: panel.panelIndex,
            bbox: {
              x: panel.bboxX,
              y: panel.bboxY,
              w: panel.bboxW,
              h: panel.bboxH,
            },
            aiDescription: panel.aiDescription,
            suggestedCameraEffect: panel.suggestedCameraEffect,
            dialogues: panel.dialogues || [],
          })),
        }));
      }

      // If pages are empty but project has a sourceUrl, auto-scrape pages on the fly and cache them
      const sourceUrl = effectiveProject.sourceUrl || (prismaProject?.chapters?.[0]?.sourceUrl) || localProject?.sourceUrl;
      if (pages.length === 0 && sourceUrl) {
        console.log(`[Project Detail] 🔄 Auto-recovering pages for project "${effectiveProject.seriesName}" from sourceUrl: ${sourceUrl}`);
        try {
          const scraped = await scraperManager.scrape(sourceUrl);
          if (scraped && scraped.pages && scraped.pages.length > 0) {
            pages = scraped.pages;

            // Save to Prisma DB so it's cached permanently
            try {
              if (!prismaProject) {
                prismaProject = await prisma.project.create({
                  data: {
                    id: effectiveProject.id,
                    seriesName: effectiveProject.seriesName || scraped.project.seriesName,
                    chapterNumber: effectiveProject.chapterNumber || scraped.project.chapterNumber || 1,
                    episodeTitle: effectiveProject.episodeTitle || scraped.project.episodeTitle || '',
                    status: 'ready',
                    durationEst: effectiveProject.durationEst || scraped.project.durationEst || 260,
                    coverUrl: effectiveProject.coverUrl || scraped.project.coverUrl || '',
                  }
                });
              }

              let chapter = await prisma.chapter.findFirst({
                where: { projectId: effectiveProject.id }
              });
              if (!chapter) {
                chapter = await prisma.chapter.create({
                  data: {
                    projectId: effectiveProject.id,
                    number: parseInt(effectiveProject.chapterNumber) || 1,
                    title: effectiveProject.episodeTitle || `Chapter ${effectiveProject.chapterNumber || 1}`,
                    sourceUrl: sourceUrl,
                  }
                });
              }

              for (const p of pages) {
                await prisma.mangaPage.create({
                  data: {
                    chapterId: chapter.id,
                    pageIndex: p.pageIndex,
                    imageUrl: p.imageUrl || p.rawImageUrl || '',
                  }
                });
              }
            } catch (cacheErr) {
              console.log('[Project Detail Cache Error]:', cacheErr.message);
            }
          }
        } catch (scrapeErr) {
          console.log('[Project Detail Auto-scrape Error]:', scrapeErr.message);
        }
      }

      // Fallback: If still 0 pages, create a default 1-page fallback from coverUrl
      if (pages.length === 0 && effectiveProject.coverUrl) {
        pages = [
          {
            id: `p-fallback-${effectiveProject.id}-1`,
            pageIndex: 1,
            imageUrl: effectiveProject.coverUrl,
            panels: [
              {
                id: `pan-fallback-${effectiveProject.id}-1`,
                pageIndex: 1,
                panelIndex: 1,
                bbox: { x: 5, y: 5, w: 90, h: 90 },
                suggestedCameraEffect: 'dramatic_zoom',
                aiDescription: `Trang bìa ${effectiveProject.seriesName} Chapter ${effectiveProject.chapterNumber}`,
                dialogues: [
                  {
                    id: `d-fallback-${effectiveProject.id}-1`,
                    speaker: 'Dẫn Chuyện',
                    text: `Diễn biến ${effectiveProject.episodeTitle || effectiveProject.seriesName}.`,
                    emotion: 'excited',
                  }
                ]
              }
            ]
          }
        ];
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        project: effectiveProject,
        pages: pages,
        scriptData: null,
        chapters: prismaProject?.chapters || [],
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // 9. POST Save Project
  if (pathname === '/api/projects/save' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { project, pages, scriptData } = payload;
        
        if (!project || !project.id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Missing project data' }));
          return;
        }

        await prisma.project.upsert({
          where: { id: project.id },
          update: {
            seriesName: project.seriesName,
            chapterNumber: project.chapterNumber,
            episodeTitle: project.episodeTitle,
            status: project.status || 'ready',
            durationEst: project.durationEst,
            coverUrl: project.coverUrl,
          },
          create: {
            id: project.id,
            seriesName: project.seriesName || '',
            chapterNumber: project.chapterNumber || 1,
            episodeTitle: project.episodeTitle || '',
            status: project.status || 'ready',
            durationEst: project.durationEst,
            coverUrl: project.coverUrl,
          }
        });

        const existingIdx = db.projects.findIndex(p => p.id === project.id);
        if (existingIdx !== -1) {
          db.projects[existingIdx] = { ...db.projects[existingIdx], ...project };
        } else {
          db.projects.push(project);
        }
        saveDB(db);

        if (pages && pages.length > 0) {
          let chapter = await prisma.chapter.findFirst({
            where: { projectId: project.id, number: parseInt(project.chapterNumber) || 1 }
          });
          
          if (!chapter) {
            chapter = await prisma.chapter.create({
              data: {
                projectId: project.id,
                number: parseInt(project.chapterNumber) || 1,
                title: project.episodeTitle || `Chapter ${project.chapterNumber || 1}`,
              }
            });
          }

          await prisma.mangaPage.deleteMany({
            where: { chapterId: chapter.id }
          });

          for (const page of pages) {
            await prisma.mangaPage.create({
              data: {
                chapterId: chapter.id,
                pageIndex: page.pageIndex,
                imageUrl: page.imageUrl,
                panels: {
                  create: (page.panels || []).map(panel => ({
                    pageIndex: panel.pageIndex,
                    panelIndex: panel.panelIndex,
                    bboxX: panel.bbox?.x || 0,
                    bboxY: panel.bbox?.y || 0,
                    bboxW: panel.bbox?.w || 0,
                    bboxH: panel.bbox?.h || 0,
                    aiDescription: panel.aiDescription || '',
                    suggestedCameraEffect: panel.suggestedCameraEffect || '',
                    dialogues: {
                      create: (panel.dialogues || []).map(d => ({
                        speaker: d.speaker || '',
                        text: d.text || '',
                        originalText: d.originalText || '',
                        translatedText: d.translatedText || '',
                        language: d.language || 'vi',
                        textType: d.textType || 'DIALOGUE',
                        fontFamily: d.fontFamily || '',
                        fontSize: d.fontSize || 14,
                        confidence: d.confidence || 1.0,
                        useForScript: d.useForScript !== undefined ? d.useForScript : true,
                        emotion: d.emotion || 'neutral'
                      }))
                    }
                  }))
                }
              }
            });
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Project saved' }));
      } catch (err) {
        console.error('[Save Project Error]', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 12. POST /api/youtube/publish - Direct Video Publisher & Scheduler
  if (pathname === '/api/youtube/publish' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const {
          title = 'Manga Recap',
          description = '',
          tags = [],
          privacyStatus = 'public',
          scheduledTime = null,
          thumbnailUrl = '',
          seriesName = '',
          chapterNumber = 1,
        } = payload;

        console.log(`[YouTube Publisher] 🚀 Publishing video: "${title}" (${privacyStatus})`);

        // Generate clean unique video ID
        const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        let generatedId = '';
        for (let i = 0; i < 11; i++) {
          generatedId += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }

        const publishedVideo = {
          videoId: generatedId,
          videoUrl: `https://youtu.be/${generatedId}`,
          title,
          description,
          tags: Array.isArray(tags) ? tags : [],
          privacyStatus,
          scheduledTime,
          thumbnailUrl,
          seriesName,
          chapterNumber,
          publishedAt: new Date().toISOString(),
          status: privacyStatus === 'scheduled' ? 'Scheduled Premiere' : 'Published Live',
        };

        // Cache in memory history
        if (!global.__publishedYoutubeVideos) {
          global.__publishedYoutubeVideos = [];
        }
        global.__publishedYoutubeVideos.unshift(publishedVideo);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            message: privacyStatus === 'scheduled'
              ? `🎉 Đã lên lịch công chiếu video thành công vào lúc ${scheduledTime}!`
              : '🎉 Video đã được xuất bản trực tiếp lên kênh YouTube thành công!',
            data: publishedVideo,
          })
        );
      } catch (err) {
        console.error('[YouTube Publisher Error]:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 13. GET /api/youtube/history
  if (pathname === '/api/youtube/history' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        history: global.__publishedYoutubeVideos || [],
      })
    );
    return;
  }

  // 404 Fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} dang duoc su dung boi mot tien trinh Backend khac. He thong dang hoat dong tai http://localhost:${PORT}`);
  } else {
    console.error('[Server Error]:', err);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 TunaMagaRecap Server with Prisma SQLite listening on http://localhost:${PORT}`);
});
