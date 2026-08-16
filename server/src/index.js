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
      let referer = customReferer || 'https://google.com/';
      let fullTargetUrl = targetImageUrl;

      if (targetImageUrl.startsWith('/')) {
        try {
          const baseOrigin = customReferer ? new URL(customReferer).origin : 'https://asuracomic.net';
          fullTargetUrl = `${baseOrigin}${targetImageUrl}`;
        } catch (e) {
          fullTargetUrl = `https://asuracomic.net${targetImageUrl}`;
        }
      }

      if (fullTargetUrl.includes('truyenvua') || fullTargetUrl.includes('truyenqq')) {
        referer = 'https://truyenqqko.com/';
      } else if (fullTargetUrl.includes('thuviensach')) {
        referer = 'https://thuviensach.vn/';
      } else if (fullTargetUrl.includes('nettruyen') || fullTargetUrl.includes('nhattruyen')) {
        referer = 'https://nettruyenco.com/';
      } else if (fullTargetUrl.includes('asura')) {
        referer = 'https://asuracomic.net/';
      }

      const imgRes = await fetch(fullTargetUrl, {
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

async function resolveAndFetchImageBuffer(imageUrl) {
  if (!imageUrl) return null;

  let targetUrl = imageUrl;
  let referer = 'https://google.com/';

  if (imageUrl.startsWith('/api/proxy-image')) {
    try {
      const proxyUrl = new URL(imageUrl, `http://localhost:${PORT}`);
      const realUrl = proxyUrl.searchParams.get('url');
      if (realUrl) {
        targetUrl = realUrl;
        referer = proxyUrl.searchParams.get('referer') || 'https://google.com/';
      }
    } catch (e) {}
  }

  if (targetUrl.includes('truyenvua') || targetUrl.includes('truyenqq')) {
    referer = 'https://truyenqqko.com/';
  } else if (targetUrl.includes('thuviensach')) {
    referer = 'https://thuviensach.vn/';
  } else if (targetUrl.includes('nettruyen') || targetUrl.includes('nhattruyen')) {
    referer = 'https://nettruyenco.com/';
  } else if (targetUrl.includes('asura')) {
    referer = 'https://asuracomic.net/';
  }

  try {
    const imgRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Referer': referer,
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    if (imgRes.ok) {
      const arrayBuffer = await imgRes.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
  } catch (e) {
    console.warn(`[Image Fetcher] Failed to download image from ${targetUrl}:`, e.message);
  }

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
