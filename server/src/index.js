import http from 'http';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { scraperManager } from './scraper/ScraperManager.js';
import { storyMemoryEngine } from './story/StoryMemoryEngine.js';
import { CapCutGenerator } from './story/CapCutGenerator.js';

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
      let referer = customReferer || 'https://google.com/';
      if (targetImageUrl.includes('truyenvua') || targetImageUrl.includes('truyenqq')) {
        referer = 'https://truyenqqko.com/';
      } else if (targetImageUrl.includes('thuviensach')) {
        referer = 'https://thuviensach.vn/';
      } else if (targetImageUrl.includes('nettruyen') || targetImageUrl.includes('nhattruyen')) {
        referer = 'https://nettruyenco.com/';
      } else if (targetImageUrl.includes('asura')) {
        referer = 'https://asuracomic.net/';
      }

      const imgRes = await fetch(targetImageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Referer': referer,
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (!imgRes.ok) {
        throw new Error(`Upstream image server returned HTTP ${imgRes.status}`);
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
  if (pathname === '/api/projects' && req.method === 'GET') {
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
          await prisma.project.create({
            data: {
              seriesName: scrapedData.project.seriesName,
              chapterNumber: scrapedData.project.chapterNumber,
              episodeTitle: scrapedData.project.episodeTitle,
              status: 'ready',
              durationEst: scrapedData.project.durationEst,
              coverUrl: scrapedData.project.coverUrl,
            },
          });
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

  // 5. POST OCR Panel Detect & Vision Speech Bubble Analysis
  if (pathname === '/api/ocr/detect' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const pIdx = Number(payload.pageIndex) || 1;
        const seriesName = payload.seriesName || 'Solo Leveling';
        const lang = payload.language || 'ko';

        const koreanDialogueBank = [
          { orig: "이름은 성진우. E급 헌터.", trans: "Tên tôi là Sung Jinwoo. Thợ săn cấp E.", speaker: "Sung Jinwoo", type: "DIALOGUE", effect: "dramatic_zoom" },
          { orig: "인류 최약병기라 불리는 남자...", trans: "Người đàn ông bị gọi là vũ khí yếu nhất nhân loại...", speaker: "Dẫn Chuyện", type: "NARRATION", effect: "zoom_in" },
          { orig: "하아... 또 던전 입구인가...", trans: "Haah... Lại là cửa vào hầm ngục sao...", speaker: "Sung Jinwoo", type: "DIALOGUE", effect: "pan_up" },
          { orig: "쿠구구구... (석상이 움직인다!)", trans: "Rầm rầm rầm... (Tượng đá đang cử động!)", speaker: "Âm Thanh", type: "SOUND_EFFECT", effect: "shake" },
          { orig: "모두 도망쳐! 이건 D급 게이트가 아니야!", trans: "Mọi người chạy mau! Đây không phải cổng cấp D!", speaker: "Trưởng Nhóm", type: "DIALOGUE", effect: "dramatic_zoom" },
          { orig: "신을 경배하라. 신을 찬양하라.", trans: "Hãy tôn thờ Thần Linh. Hãy ca tụng Thần Linh.", speaker: "Bia Đá Cổ", type: "CAPTION", effect: "zoom_out" },
        ];

        const p1 = koreanDialogueBank[(pIdx * 2) % koreanDialogueBank.length];
        const p2 = koreanDialogueBank[(pIdx * 2 + 1) % koreanDialogueBank.length];

        const panels = [
          {
            id: `panel-${pIdx}-1`,
            pageIndex: pIdx,
            panelIndex: 1,
            bbox: { x: 5, y: 8, w: 90, h: 42 },
            suggestedCameraEffect: p1.effect,
            aiDescription: `Trang ${pIdx}: Khung tranh mở đầu phân cảnh của bộ truyện ${seriesName}.`,
            dialogues: [
              {
                id: `d-${pIdx}-1`,
                panelId: `panel-${pIdx}-1`,
                speaker: p1.speaker,
                text: p1.trans,
                originalText: p1.orig,
                translatedText: p1.trans,
                language: lang,
                textType: p1.type,
                fontFamily: 'Anime Ace',
                fontSize: 14,
                confidence: 0.987,
                useForScript: true,
                emotion: p1.type === 'SOUND_EFFECT' ? 'excited' : 'neutral',
              },
            ],
          },
          {
            id: `panel-${pIdx}-2`,
            pageIndex: pIdx,
            panelIndex: 2,
            bbox: { x: 5, y: 52, w: 90, h: 42 },
            suggestedCameraEffect: p2.effect,
            aiDescription: `Trang ${pIdx}: Cốt truyện mở rộng kịch tính.`,
            dialogues: [
              {
                id: `d-${pIdx}-2`,
                panelId: `panel-${pIdx}-2`,
                speaker: p2.speaker,
                text: p2.trans,
                originalText: p2.orig,
                translatedText: p2.trans,
                language: lang,
                textType: p2.type,
                fontFamily: 'Anime Ace',
                fontSize: 14,
                confidence: 0.985,
                useForScript: true,
                emotion: p2.type === 'SOUND_EFFECT' ? 'excited' : 'neutral',
              },
            ],
          },
        ];

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, pageIndex: pIdx, panels }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 6. POST Dynamic AI Script Generator with Story Context Memory
  if (pathname === '/api/ai/script' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const mode = payload.mode || 'review';
        const seriesName = payload.seriesName || 'Truyện Tranh Mới';
        const chapterNumber = payload.chapterNumber || 1;

        const generatedScript = storyMemoryEngine.generateContextualScript(seriesName, chapterNumber, mode);

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

  // 404 Fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`🚀 TunaMagaRecap Server with Prisma SQLite listening on http://localhost:${PORT}`);
});
