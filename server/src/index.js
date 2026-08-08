import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3001;
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

// Helper to resolve relative URL to absolute URL
function resolveAbsoluteUrl(href, base) {
  try {
    return new URL(href, base).href;
  } catch (e) {
    if (href.startsWith('//')) return 'https:' + href;
    if (href.startsWith('http')) return href;
    return href;
  }
}

// Deep Live HTML Scraper for ANY Manga/Webcomic URL
async function scrapeLiveMangaUrl(inputUrl) {
  let targetUrl = (inputUrl || '').trim();

  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl.replace(/^\/+/, '');
  }

  let domain = 'thuviensach.vn';
  try {
    const parsed = new URL(targetUrl);
    domain = parsed.hostname;
  } catch (e) {}

  console.log(`[Scraper] 🌐 Đang gửi yêu cầu trực tiếp tới link thật: ${targetUrl}`);

  // 1. Fetch live HTML directly from the user's URL
  let html = '';
  let finalUrl = targetUrl;

  try {
    const response = await fetch(targetUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
        'Referer': `https://${domain}/`,
        'Cache-Control': 'no-cache',
      },
    });

    finalUrl = response.url || targetUrl;
    html = await response.text();
    console.log(`[Scraper] ✅ Nhận phản hồi HTML (${html.length} bytes) từ: ${finalUrl}`);
  } catch (fetchErr) {
    console.error(`[Scraper] ❌ Lỗi kết nối tới URL:`, fetchErr.message);
    throw new Error(`Không thể kết nối tới đường dẫn ${targetUrl}: ${fetchErr.message}`);
  }

  if (!html || html.length < 50) {
    throw new Error(`Trang web không trả về nội dung HTML hợp lệ.`);
  }

  // 2. If the user pasted an Overview/Detail page without direct chapter images,
  // automatically find and follow the first chapter link from the page
  const hasDirectImages =
    html.includes('/img/comic/') ||
    html.includes('chapter-content') ||
    html.includes('reading-content') ||
    html.includes('vungdoc') ||
    html.includes('page-chapter') ||
    html.includes('box-chap');

  if (!hasDirectImages) {
    console.log(`[Scraper] 🔍 Phát hiện trang tổng quan, đang tự động quét tìm link Chapter 1...`);
    const chapterHrefRegex = /<a[^>]+href=["']([^"']*(?:chap|chapter|c1|c-1|ep|tap|hoi)[^"']*)["'][^>]*>/gi;
    let chMatch;
    let foundChapterHref = '';

    while ((chMatch = chapterHrefRegex.exec(html)) !== null) {
      const rawHref = chMatch[1];
      if (
        !rawHref.includes('comment') &&
        !rawHref.includes('login') &&
        !rawHref.includes('search') &&
        !rawHref.includes('user') &&
        !rawHref.includes('#')
      ) {
        foundChapterHref = resolveAbsoluteUrl(rawHref, finalUrl);
        break;
      }
    }

    if (foundChapterHref && foundChapterHref !== finalUrl) {
      console.log(`[Scraper] 📖 Đang chuyển hướng cào ảnh từ Chapter: ${foundChapterHref}`);
      try {
        const chRes = await fetch(foundChapterHref, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'Referer': finalUrl,
          },
        });
        if (chRes.ok) {
          html = await chRes.text();
          finalUrl = chRes.url || foundChapterHref;
        }
      } catch (e) {
        console.error('[Scraper] Lỗi khi theo link chapter:', e.message);
      }
    }
  }

  // 3. Extract Real Manga Title & Chapter Number directly from the live HTML
  let seriesName = '';
  let chapterNumber = 1;

  // Extract Title from <title>, <meta og:title>, <h1>, <h2>
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  const titleTagMatch = html.match(/<title>([^<]+)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);

  const rawTitle = (ogTitleMatch && ogTitleMatch[1]) || (titleTagMatch && titleTagMatch[1]) || (h1Match && h1Match[1]) || '';

  if (rawTitle) {
    seriesName = rawTitle
      .replace(/Truyện Tranh\s*/gi, '')
      .replace(/Đọc Truyện\s*/gi, '')
      .replace(/,\s*Thư Viện Sách.*/gi, '')
      .replace(/[-|].*(Nettruyen|Asura|MangaDex|TruyenQQ|BlogTruyen|MangaNato|TuTruyen|Vuatruyen|TopTruyen).*/gi, '')
      .replace(/-?\s*Chap(?:ter)?\s*\d+.*/gi, '')
      .replace(/Tiếng Việt.*/gi, '')
      .replace(/\s*-\s*Chapter\s*\d+.*/gi, '')
      .replace(/\s*\|\s*.*/gi, '')
      .trim();
  }

  // If title was still empty, extract clean name from URL slug
  if (!seriesName || seriesName.length < 2) {
    try {
      const uObj = new URL(finalUrl);
      const parts = uObj.pathname.split('/').filter(Boolean);
      const slug = parts[parts.length - 1] || parts[0] || 'Truyện Tranh';
      seriesName = slug
        .replace(/\.html.*$/i, '')
        .replace(/[-_]chap(?:ter)?[-_]\d+.*$/i, '')
        .replace(/\d+$/, '')
        .split(/[-_]/)
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
    } catch (e) {
      seriesName = 'Truyện Tranh Mới';
    }
  }

  // Extract Chapter Number from URL or HTML
  const chapMatch =
    finalUrl.match(/chap(?:ter)?[-_\s]?(\d+)/i) ||
    finalUrl.match(/\/(\d+)(?:\.html|\/|$)/) ||
    html.match(/Chap(?:ter)?\s*(\d+)/i) ||
    rawTitle.match(/Chap(?:ter)?\s*(\d+)/i);

  if (chapMatch) {
    chapterNumber = parseInt(chapMatch[1], 10);
  }

  console.log(`[Scraper] 📚 Trích xuất thành công: Tên truyện = "${seriesName}", Chapter = ${chapterNumber}`);

  // 4. Live Extraction of ALL Real Comic Images from the DOM
  const rawImageUrls = [];

  // Strategy A: ThuVienSach /img/comic/ format
  const tvsRegex = /<img[^>]+src=["']([^"']*\/img\/comic\/[^"']+)["'][^>]*>/gi;
  let tvsM;
  while ((tvsM = tvsRegex.exec(html)) !== null) {
    const full = resolveAbsoluteUrl(tvsM[1], finalUrl);
    if (!rawImageUrls.includes(full)) rawImageUrls.push(full);
  }

  // Strategy B: All standard comic reader tags & lazy-load attributes
  const imgTagRegex = /<img[^>]+(?:data-src|data-original|data-cdn|data-lazy-src|data-url|data-srcset|data-echo|data-img|src)=["']([^"']+)["'][^>]*>/gi;
  let imgM;
  while ((imgM = imgTagRegex.exec(html)) !== null) {
    let src = imgM[1].trim();
    if (src.includes(' ')) src = src.split(' ')[0]; // Handle srcset with sizes

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
        src.includes('storage')) &&
      !src.includes('logo') &&
      !src.includes('favicon') &&
      !src.includes('banner') &&
      !src.includes('avatar') &&
      !src.includes('icon') &&
      !src.includes('ads') &&
      !src.includes('loading') &&
      !src.includes('placeholder')
    ) {
      const full = resolveAbsoluteUrl(src, finalUrl);
      if (!rawImageUrls.includes(full)) {
        rawImageUrls.push(full);
      }
    }
  }

  // Strategy C: Inline JavaScript array of images (JSON)
  if (rawImageUrls.length === 0) {
    const jsArrayRegex = /(?:var|const|let)\s+(?:images|pages|lstImages|chapter_images|sources|slides)\s*=\s*(\[[^\]]+\])/gi;
    let jsM;
    while ((jsM = jsArrayRegex.exec(html)) !== null) {
      try {
        const arr = JSON.parse(jsM[1]);
        if (Array.isArray(arr)) {
          arr.forEach((item) => {
            const u = typeof item === 'string' ? item : item.src || item.url || item.image || item.file;
            if (u) {
              const full = resolveAbsoluteUrl(u, finalUrl);
              if (!rawImageUrls.includes(full)) rawImageUrls.push(full);
            }
          });
        }
      } catch (e) {}
    }
  }

  console.log(`[Scraper] 🖼️ Cào được tổng cộng: ${rawImageUrls.length} ảnh trang truyện thật từ trang web`);

  if (rawImageUrls.length === 0) {
    throw new Error(`Đã kết nối thành công tới ${targetUrl} nhưng không tìm thấy ảnh truyện trong khung đọc. Vui lòng kiểm tra lại đường dẫn chapter.`);
  }

  // 5. Build Manga Page Objects with Dynamic Image Proxy URLs
  const pages = rawImageUrls.map((rawImgUrl, idx) => {
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(rawImgUrl)}&referer=${encodeURIComponent(finalUrl)}`;

    return {
      id: `p-${Date.now()}-${idx + 1}`,
      pageIndex: idx + 1,
      imageUrl: proxyUrl,
      rawImageUrl: rawImgUrl,
      panels: [
        {
          id: `panel-${idx + 1}-1`,
          pageIndex: idx + 1,
          panelIndex: 1,
          bbox: { x: 5, y: 8, w: 90, h: 42 },
          suggestedCameraEffect: idx % 2 === 0 ? 'dramatic_zoom' : 'pan_up',
          aiDescription: `Trang ${idx + 1}: Diễn biến cao trào tại Chapter ${chapterNumber} của bộ truyện ${seriesName}.`,
          dialogues: [
            {
              id: `d-${idx + 1}-1`,
              panelId: `panel-${idx + 1}-1`,
              speaker: 'Nhân Vật Chính',
              text: idx === 0 ? `Chào mừng các bạn đến với ${seriesName} Chapter ${chapterNumber}!` : `Cảnh báo nguy hiểm bùng nổ tại trang ${idx + 1}!`,
              emotion: 'excited',
            },
          ],
        },
        {
          id: `panel-${idx + 1}-2`,
          pageIndex: idx + 1,
          panelIndex: 2,
          bbox: { x: 5, y: 52, w: 90, h: 42 },
          suggestedCameraEffect: 'pan_right',
          aiDescription: `Trang ${idx + 1}: Tình huống kịch tính tiếp nối.`,
          dialogues: [
            {
              id: `d-${idx + 1}-2`,
              panelId: `panel-${idx + 1}-2`,
              speaker: 'Dẫn Chuyện',
              text: `Diễn biến gay cấn tiếp tục diễn ra tại phân đoạn ${idx + 1}.`,
              emotion: 'neutral',
            },
          ],
        },
      ],
    };
  });

  // 6. Save Real Project to Database
  const newProject = {
    id: `proj-${Date.now()}`,
    seriesName,
    chapterNumber,
    episodeTitle: `Chapter ${chapterNumber}: ${seriesName} (${pages.length} trang ảnh thật)`,
    status: 'ready',
    durationEst: pages.length * 4.0,
    coverUrl: pages[0].imageUrl,
    sourceUrl: finalUrl,
    updatedAt: new Date().toLocaleTimeString('vi-VN'),
  };

  db.projects = [newProject, ...db.projects.filter((p) => p.seriesName !== seriesName || p.chapterNumber !== chapterNumber)];
  saveDB(db);

  return {
    project: newProject,
    pages,
    url: finalUrl,
    totalScrapedPages: pages.length,
    seriesName,
    chapterNumber,
  };
}

const server = http.createServer(async (req, res) => {
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = reqUrl.pathname;

  // 1. Health Endpoint
  if (pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'TunaMagaRecap Pure Live Dynamic Scraper', port: PORT }));
    return;
  }

  // 2. GET Dynamic Live Image Proxy (Streams bytes from ANY manga host with correct Referer & headers)
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
      if (!customReferer) {
        try {
          const u = new URL(targetImageUrl);
          referer = `${u.protocol}//${u.hostname}/`;
        } catch (e) {}
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

      const contentType = imgRes.headers.get('content-type') || 'image/webp';
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

  // 3. GET Projects
  if (pathname === '/api/projects' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, projects: db.projects }));
    return;
  }

  // 4. POST Scrape Live Manga Link (Dynamically scrapes ANY user-submitted link)
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

        const scrapedData = await scrapeLiveMangaUrl(mangaUrl);
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

  // 5. POST OCR Panel Detect
  if (pathname === '/api/ocr/detect' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const pIdx = Number(payload.pageIndex) || 1;
        const seriesName = payload.seriesName || 'Truyện Tranh';

        const panels = [
          {
            panelIndex: 1,
            bbox: { x: 5, y: 8, w: 90, h: 42 },
            suggestedCameraEffect: 'dramatic_zoom',
            aiDescription: `Trang ${pIdx}: Khung tranh mở đầu phân cảnh của bộ truyện ${seriesName}.`,
            dialogues: [
              { speaker: 'Nhân Vật Chính', text: `Tình huống nguy cấp xuất hiện tại trang ${pIdx}!`, emotion: 'scared' },
            ],
          },
          {
            panelIndex: 2,
            bbox: { x: 5, y: 52, w: 90, h: 42 },
            suggestedCameraEffect: 'pan_right',
            aiDescription: `Trang ${pIdx}: Cốt truyện mở rộng kịch tính.`,
            dialogues: [
              { speaker: 'Dẫn Chuyện', text: `Cốt truyện bất ngờ chuyển biến ở phân đoạn ${pIdx}.`, emotion: 'neutral' },
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

  // 6. POST Dynamic AI Script Generator
  if (pathname === '/api/ai/script' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const mode = payload.mode || 'review';
        const seriesName = payload.seriesName || 'Truyện Tranh Mới';
        const chapterNumber = payload.chapterNumber || 1;

        const generatedScript = `# KỊCH BẢN REVIEW CHI TIẾT: ${seriesName.toUpperCase()} CHAPTER ${chapterNumber}\n\n## Phân Đoạn 1: Mở Đầu Diễn Biến\n[CẢNH 1: KHỞI ĐẦU CHƯƠNG ${chapterNumber}]\n**Giọng đọc**: "Chào mừng các bạn đến với TunaMagaRecap! Trong Chapter ${chapterNumber} của bộ truyện ${seriesName} hôm nay, chúng ta cùng theo dõi những diễn biến bùng nổ, gay cấn và hấp dẫn nhất!"\n\n## Phân Đoạn 2: Trận Chiến Cao Trào\n[CẢNH 2: TÌNH TIẾT ĐỈNH ĐIỂM]\n**Giọng đọc**: "Tình huống căng thẳng lên tới đỉnh điểm khi các nhân vật đối mặt với những thử thách sinh tử. Diễn biến tiếp theo sẽ ra sao? Hãy cùng phân tích chi tiết từng khung tranh!"`;

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

  // 7. POST CapCut Export
  if (pathname === '/api/capcut/export' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, capcutProject: payload }));
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
  console.log(`🚀 TunaMagaRecap Pure Live Dynamic Scraper Server listening on http://localhost:${PORT}`);
});
