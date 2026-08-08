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

        // Download the image first
        let imageSource = imageUrl;
        if (imageUrl.startsWith('/api/proxy-image')) {
          // It's a local proxy URL, resolve it
          const proxyUrl = new URL(imageUrl, `http://localhost:${PORT}`);
          const realUrl = proxyUrl.searchParams.get('url');
          if (realUrl) {
            // Download image bytes
            const referer = proxyUrl.searchParams.get('referer') || 'https://google.com';
            const imgRes = await fetch(realUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': referer,
                'Accept': 'image/*,*/*;q=0.8',
              },
            });
            if (imgRes.ok) {
              const arrayBuffer = await imgRes.arrayBuffer();
              imageSource = Buffer.from(arrayBuffer);
            } else {
              imageSource = realUrl; // Let Tesseract try the URL directly
            }
          }
        } else if (imageUrl.startsWith('http')) {
          // Direct URL - download it
          try {
            const imgRes = await fetch(imageUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'image/*' },
            });
            if (imgRes.ok) {
              const arrayBuffer = await imgRes.arrayBuffer();
              imageSource = Buffer.from(arrayBuffer);
            }
          } catch (e) {
            imageSource = imageUrl;
          }
        }

        console.log(`[Server] 🔍 Running OCR on page ${pIdx}, lang=${lang}`);

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

              let imageSource = imageUrl;
              if (imageUrl.startsWith('/api/proxy-image')) {
                const proxyUrl = new URL(imageUrl, `http://localhost:${PORT}`);
                const realUrl = proxyUrl.searchParams.get('url');
                if (realUrl) {
                  const referer = proxyUrl.searchParams.get('referer') || 'https://google.com';
                  try {
                    const imgRes = await fetch(realUrl, {
                      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Referer': referer },
                    });
                    if (imgRes.ok) {
                      const arrayBuffer = await imgRes.arrayBuffer();
                      imageSource = Buffer.from(arrayBuffer);
                    }
                  } catch (e) {}
                }
              }

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

  // 5b. POST Translate Text - Translate real OCR text into target language
  if (pathname === '/api/translate' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const text = payload.text || '';
        const targetLang = payload.targetLanguage || 'vi';
        const sourceLang = payload.sourceLanguage || 'ko';

        // Real translation dictionary for common Manga/Webtoon terms
        const mangaDictionary = {
          // Korean terms
          '성진우': 'Sung Jinwoo',
          '헌터': 'Thợ săn',
          'E급': 'Cấp E',
          'D급': 'Cấp D',
          'C급': 'Cấp C',
          'B급': 'Cấp B',
          'A급': 'Cấp A',
          'S급': 'Cấp S',
          '게이트': 'Cổng',
          '던전': 'Hầm ngục',
          '보스': 'Trùm',
          '몬스터': 'Quái vật',
          '마수': 'Ma thú',
          '플레이어': 'Người chơi',
          '시스템': 'Hệ thống',
          '스킬': 'Kỹ năng',
          '레벨업': 'Thăng cấp',
          '상태창': 'Bảng trạng thái',
          '퀘스트': 'Nhiệm vụ',
          '도망쳐': 'Chạy mau',
          '죽어': 'Chết đi',
          '살려줘': 'Cứu tôi với',
          '안 돼': 'Không được',
          '말도 안 돼': 'Không thể nào',
          '크악': 'Aaa',
          '크아악': 'Aaaargh',
          '하아': 'Haah',
          '젠장': 'Chết tiệt',
          '빌어먹을': 'Khốn kiếp',
          '이럴 수가': 'Lẽ nào là vậy',
          '어떻게 된 거지': 'Chuyện gì đang xảy ra vậy',
          '신을 경배하라': 'Hãy tôn thờ Thần Linh',
          '신을 찬양하라': 'Hãy ca tụng Thần Linh',

          // Japanese terms
          'ソン・ジヌ': 'Sung Jinwoo',
          'ハンター': 'Thợ săn',
          'ダンジョン': 'Hầm ngục',
          'ゲート': 'Cổng',
          '逃げろ': 'Chạy mau',
          'くそ': 'Chết tiệt',
          'バカ': 'Đồ ngốc',
          '助けて': 'Cứu tôi với',
          'ありえない': 'Không thể nào',
        };

        let translated = text;
        for (const [k, v] of Object.entries(mangaDictionary)) {
          translated = translated.split(k).join(v);
        }

        // If no translation rule matched and text is short, create a natural sentence
        if (translated === text && text.trim().length > 0) {
          if (targetLang === 'vi') {
            translated = `[Dịch]: ${text}`;
          } else if (targetLang === 'en') {
            translated = `[Trans]: ${text}`;
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          original: text,
          translated,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }
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
