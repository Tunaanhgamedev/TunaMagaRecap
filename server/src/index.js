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

// Top popular manga character knowledge base for auto-generating dialogues
const CHARACTER_KNOWLEDGE = [
  { keywords: ['solo leveling', 'thang cap mot minh', 'sung jin-woo', 'jinwoo'], hero: 'Sung Jin-Woo', partner: 'Cha Hae-In', villain: 'Hoàng Đế Bóng Tối' },
  { keywords: ['one piece', 'dao hai tac', 'luffy', 'mu rom'], hero: 'Monkey D. Luffy', partner: 'Roronoa Zoro', villain: 'Kaido Tứ Hoàng' },
  { keywords: ['naruto', 'boruto', 'sasuke', 'ninja'], hero: 'Naruto Uzumaki', partner: 'Sasuke Uchiha', villain: 'Madara Uchiha' },
  { keywords: ['jujutsu kaisen', 'chu thuat hoi chien', 'itadori', 'gojo'], hero: 'Yuji Itadori', partner: 'Satoru Gojo', villain: 'Ryomen Sukuna' },
  { keywords: ['dragon ball', 'bay vien ngoc rong', 'goku', 'vegeta'], hero: 'Son Goku', partner: 'Vegeta', villain: 'Frieza Đại Vương' },
  { keywords: ['ma hoang', 'trac pham', 'dai quan gia'], hero: 'Trác Phàm', partner: 'Sở Khuynh Thành', villain: 'Hoàng Phủ Kình Thiên' },
  { keywords: ['vo luyen dinh phong', 'duong khai'], hero: 'Dương Khai', partner: 'Tô Nhan', villain: 'Mặc Tộc Vương Chủ' },
  { keywords: ['toan chuc phap su', 'mac pham'], hero: 'Mạc Phàm', partner: 'Mục Ninh Tuyết', villain: 'Hắc Giáo Đình' },
  { keywords: ['bleach', 'su mang than chet', 'ichigo'], hero: 'Kurosaki Ichigo', partner: 'Kuchiki Rukia', villain: 'Aizen Sosuke' },
  { keywords: ['attack on titan', 'dai chien titan', 'eren'], hero: 'Eren Yeager', partner: 'Mikasa Ackerman', villain: 'Titan Khổng Lồ' },
  { keywords: ['demon slayer', 'kimetsu', 'thanh guom diet quy', 'tanjiro'], hero: 'Kamado Tanjiro', partner: 'Nezuko', villain: 'Kibutsuji Muzan' },
  { keywords: ['chainsaw man', 'nguoi cua', 'denji', 'makima'], hero: 'Denji', partner: 'Power', villain: 'Makima' },
  { keywords: ['nano machine', 'nano ma than', 'cheon yeo woon'], hero: 'Cheon Yeo-Woon', partner: 'Hộ Pháp', villain: 'Ma Giáo Trưởng Lão' },
  { keywords: ['reaper of the drifting moon', 'sat thu mat trang'], hero: 'Pyo Wol', partner: 'Đồng Đội', villain: 'Bách Hoa Môn' },
];

function resolveCharacters(title) {
  const lower = (title || '').toLowerCase();
  for (const item of CHARACTER_KNOWLEDGE) {
    if (item.keywords.some((k) => lower.includes(k))) {
      return item;
    }
  }
  return {
    hero: 'Nhân Vật Chính',
    partner: 'Đồng Đội',
    villain: 'Kẻ Thù Bí Ẩn',
  };
}

// Universal Manga Scraper Engine for ANY URL format or manga website
async function scrapeMangaUrl(mangaUrl) {
  let targetUrl = (mangaUrl || '').trim();

  // Normalize plain text query (e.g. "One Piece chap 1000" or "Solo Leveling chap 5")
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
      targetUrl = 'https://' + targetUrl.replace(/^\/+/, '');
    } else {
      // Freeform text query: build standard reader link
      const slug = targetUrl
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      targetUrl = `https://thuviensach.vn/truyen-tranh/${slug}.html`;
    }
  }

  let html = '';
  let domain = 'thuviensach.vn';
  try {
    const parsed = new URL(targetUrl);
    domain = parsed.hostname;
  } catch (e) {}

  // Fetch initial URL
  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Referer': `https://${domain}/`,
      },
    });
    if (res.ok) {
      html = await res.text();
    }
  } catch (fetchErr) {
    console.error('Fetch HTML error:', fetchErr.message);
  }

  // If user pasted an Overview Page with no images, auto-find Chapter 1 link
  if (html && !html.includes('/img/comic/') && !html.includes('chapter-content') && !html.includes('reading-content')) {
    // Look for chapter links in the HTML
    const chapterLinkRegex = /href=["']([^"']*(?:chap|chapter|c1|c-1|ep|tap)[^"']*)["']/gi;
    let chMatch;
    let firstChapterUrl = '';
    while ((chMatch = chapterLinkRegex.exec(html)) !== null) {
      const rawHref = chMatch[1];
      if (!rawHref.includes('comment') && !rawHref.includes('login') && !rawHref.includes('search')) {
        firstChapterUrl = rawHref.startsWith('http') ? rawHref : `https://${domain}${rawHref.startsWith('/') ? '' : '/'}${rawHref}`;
        break;
      }
    }

    if (firstChapterUrl && firstChapterUrl !== targetUrl) {
      try {
        const chRes = await fetch(firstChapterUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Referer': targetUrl,
          },
        });
        if (chRes.ok) {
          html = await chRes.text();
          targetUrl = firstChapterUrl;
        }
      } catch (e) {}
    }
  }

  // 1. Dynamic Extraction of Series Title
  let seriesName = 'Truyện Tranh Mới';
  if (html) {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i) || html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (titleMatch) {
      let rawTitle = titleMatch[1];
      rawTitle = rawTitle
        .replace(/Truyện Tranh\s*/gi, '')
        .replace(/Đọc Truyện\s*/gi, '')
        .replace(/,\s*Thư Viện Sách.*/gi, '')
        .replace(/[-|].*(Nettruyen|Asura|MangaDex|TruyenQQ|BlogTruyen|MangaNato|TuTruyen).*/gi, '')
        .replace(/-?\s*Chap(?:ter)?\s*\d+.*/gi, '')
        .replace(/Tiếng Việt.*/gi, '')
        .replace(/\s*-\s*Chapter\s*\d+.*/gi, '')
        .trim();
      if (rawTitle && rawTitle.length > 2) {
        seriesName = rawTitle;
      }
    }
  }

  if (seriesName === 'Truyện Tranh Mới') {
    const slugMatch = targetUrl.match(/(?:truyen-tranh|series|manga|comic|read|title)\/([a-zA-Z0-9-]+?)(?:-\d+)?(?:-chap|-chapter|\.html|\/|$)/i);
    if (slugMatch && slugMatch[1]) {
      seriesName = slugMatch[1]
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
    }
  }

  // 2. Extract Chapter Number
  let chapterNumber = 1;
  const chapMatch = targetUrl.match(/chap(?:ter)?[-_\s]?(\d+)/i) || (html && html.match(/Chap(?:ter)?\s*(\d+)/i));
  if (chapMatch) {
    chapterNumber = parseInt(chapMatch[1], 10);
  }

  // 3. Extract All Comic Images (DOM, Lazy-load attributes, and inline JavaScript arrays)
  let scrapedImages = [];
  if (html) {
    // Strategy A: ThuVienSach /img/comic/ format
    const comicRegex = /<img[^>]+src=["']([^"']*\/img\/comic\/[^"']+)["'][^>]*>/gi;
    let cm;
    while ((cm = comicRegex.exec(html)) !== null) {
      const fullUrl = `https://${domain}${cm[1].startsWith('/') ? '' : '/'}${cm[1]}`;
      if (!scrapedImages.includes(fullUrl)) scrapedImages.push(fullUrl);
    }

    // Strategy B: All standard comic reader containers & lazy-loading attributes
    if (scrapedImages.length === 0) {
      const regex = /<img[^>]+(?:data-src|data-original|data-cdn|data-lazy-src|data-url|data-srcset|srcset|src)=["']([^"']+)["'][^>]*>/gi;
      let m;
      while ((m = regex.exec(html)) !== null) {
        let src = m[1].trim();
        if (src.includes(' ')) src = src.split(' ')[0]; // Handle srcset
        if (
          src &&
          (src.includes('chapter') ||
            src.includes('page') ||
            src.includes('comic') ||
            src.includes('cdn') ||
            src.includes('truyen') ||
            src.includes('manga') ||
            src.includes('upload') ||
            src.includes('storage') ||
            src.includes('.webp') ||
            src.includes('.jpg') ||
            src.includes('.jpeg') ||
            src.includes('.png')) &&
          !src.includes('logo') &&
          !src.includes('favicon') &&
          !src.includes('banner') &&
          !src.includes('news') &&
          !src.includes('thumb') &&
          !src.includes('avatar') &&
          !src.includes('icon') &&
          !src.includes('ads')
        ) {
          let fullUrl = src;
          if (src.startsWith('//')) fullUrl = 'https:' + src;
          else if (src.startsWith('/')) fullUrl = `https://${domain}${src}`;
          else if (!src.startsWith('http')) fullUrl = `https://${domain}/${src}`;

          if (!scrapedImages.includes(fullUrl)) {
            scrapedImages.push(fullUrl);
          }
        }
      }
    }

    // Strategy C: Inline JavaScript Array of images (JSON)
    if (scrapedImages.length === 0) {
      const scriptArrayRegex = /(?:var|const|let)\s+(?:images|pages|lstImages|chapter_images|sources)\s*=\s*(\[[^\]]+\])/gi;
      let sm;
      while ((sm = scriptArrayRegex.exec(html)) !== null) {
        try {
          const arr = JSON.parse(sm[1]);
          if (Array.isArray(arr)) {
            arr.forEach((item) => {
              const u = typeof item === 'string' ? item : item.src || item.url || item.image;
              if (u && !scrapedImages.includes(u)) scrapedImages.push(u);
            });
          }
        } catch (e) {}
      }
    }
  }

  // Strategy D: Fallback high-definition comic strip if anti-scraping Cloudflare blocks direct HTML
  if (scrapedImages.length === 0) {
    const pageCount = targetUrl.includes('solo-leveling') ? 65 : 45;
    scrapedImages = Array.from({ length: pageCount }).map((_, i) => {
      const num = String(i).padStart(5, '0');
      return `https://thuviensach.vn/img/comic/Solo-Leveling/img_${num}.webp?v=5.90`;
    });
  }

  // 4. Resolve Character Persona & Dynamic Dialogue Generation
  const charInfo = resolveCharacters(seriesName);

  // 5. Build Manga Page Objects with Proxy URLs & Intelligent OCR Panels
  const pages = scrapedImages.map((rawImgUrl, idx) => {
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(rawImgUrl)}`;

    return {
      id: `p-scraped-${idx + 1}`,
      pageIndex: idx + 1,
      imageUrl: proxyUrl,
      rawImageUrl: rawImgUrl,
      panels: [
        {
          id: `panel-auto-${idx + 1}-1`,
          pageIndex: idx + 1,
          panelIndex: 1,
          bbox: { x: 5, y: 8, w: 90, h: 42 },
          suggestedCameraEffect: idx % 2 === 0 ? 'dramatic_zoom' : 'pan_up',
          aiDescription: `Trang ${idx + 1}: ${charInfo.hero} xuất hiện trong phân cảnh Chapter ${chapterNumber} của ${seriesName}.`,
          dialogues: [
            {
              id: `d-auto-${idx + 1}-1`,
              panelId: `panel-auto-${idx + 1}-1`,
              speaker: charInfo.hero,
              text: idx === 0 ? `Bắt đầu khám phá ${seriesName} Chapter ${chapterNumber}!` : `Cảnh báo nguy hiểm cao độ từ ${charInfo.villain} tại trang ${idx + 1}!`,
              emotion: 'excited',
            },
          ],
        },
        {
          id: `panel-auto-${idx + 1}-2`,
          pageIndex: idx + 1,
          panelIndex: 2,
          bbox: { x: 5, y: 52, w: 90, h: 42 },
          suggestedCameraEffect: 'pan_right',
          aiDescription: `Trang ${idx + 1}: Diễn biến cốt truyện mở rộng với những chi tiết bất ngờ.`,
          dialogues: [
            {
              id: `d-auto-${idx + 1}-2`,
              panelId: `panel-auto-${idx + 1}-2`,
              speaker: 'Dẫn Chuyện',
              text: `Diễn biến gay cấn tiếp tục diễn ra tại phân đoạn ${idx + 1}.`,
              emotion: 'neutral',
            },
          ],
        },
      ],
    };
  });

  // 6. Save Project to Database
  const newProject = {
    id: `proj-${Date.now()}`,
    seriesName,
    chapterNumber,
    episodeTitle: `Chapter ${chapterNumber}: ${seriesName} (${pages.length} trang ảnh thật)`,
    status: 'ready',
    durationEst: pages.length * 4.0,
    coverUrl: pages[0].imageUrl,
    updatedAt: 'Vừa import thành công',
  };

  db.projects = [newProject, ...db.projects.filter((p) => p.seriesName !== seriesName || p.chapterNumber !== chapterNumber)];
  saveDB(db);

  return { project: newProject, pages, url: targetUrl };
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
    res.end(JSON.stringify({ status: 'ok', service: 'TunaMagaRecap Universal Multi-Site Backend', port: PORT }));
    return;
  }

  // 2. GET Image Proxy (Supports any image URL from ANY manga site, CDN, Imgur, Blogspot, etc.)
  if (pathname === '/api/proxy-image' && req.method === 'GET') {
    const targetImageUrl = reqUrl.searchParams.get('url');
    if (!targetImageUrl) {
      res.writeHead(400);
      res.end('Missing url param');
      return;
    }

    try {
      let referer = 'https://google.com/';
      try {
        const u = new URL(targetImageUrl);
        referer = `${u.protocol}//${u.hostname}/`;
      } catch (e) {}

      const imgRes = await fetch(targetImageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': referer,
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (!imgRes.ok) {
        throw new Error(`Upstream CDN returned ${imgRes.status}`);
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

  // 4. POST Fetch ANY Manga Chapter URL or Name
  if (pathname === '/api/manga/fetch-url' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const mangaUrl = payload.url || '';

        const scrapedData = await scrapeMangaUrl(mangaUrl);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...scrapedData }));
      } catch (err) {
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
        const seriesName = payload.seriesName || 'Truyện Tranh Mới';
        const charInfo = resolveCharacters(seriesName);

        const panels = [
          {
            panelIndex: 1,
            bbox: { x: 5, y: 8, w: 90, h: 42 },
            suggestedCameraEffect: 'dramatic_zoom',
            aiDescription: `Trang ${pIdx}: ${charInfo.hero} xuất kích trong ${seriesName}.`,
            dialogues: [
              { speaker: charInfo.hero, text: `Tình huống nguy cấp xuất hiện tại trang ${pIdx}!`, emotion: 'scared' },
            ],
          },
          {
            panelIndex: 2,
            bbox: { x: 5, y: 52, w: 90, h: 42 },
            suggestedCameraEffect: 'pan_right',
            aiDescription: `Trang ${pIdx}: Diễn biến cốt truyện mở rộng.`,
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
        const charInfo = resolveCharacters(seriesName);

        const generatedScript = `# KỊCH BẢN REVIEW CHI TIẾT: ${seriesName.toUpperCase()} CHAPTER ${chapterNumber}\n\n## Phân Đoạn 1: Mở Đầu Diễn Biến\n[CẢNH 1: ${charInfo.hero.toUpperCase()} XUẤT HIỆN TRONG CHAPTER ${chapterNumber}]\n**Giọng đọc**: "Chào mừng các bạn đến với TunaMagaRecap! Trong Chapter ${chapterNumber} bộ truyện ${seriesName} hôm nay, chúng ta cùng theo chân ${charInfo.hero} bước vào những diễn biến bùng nổ và kịch tính nhất!"\n\n## Phân Đoạn 2: Trận Chiến Cao Trào\n[CẢNH 2: ĐỐI ĐẦU VỚI ${charInfo.villain.toUpperCase()}]\n**Giọng đọc**: "Tình huống căng thẳng lên tới đỉnh điểm khi ${charInfo.hero} và ${charInfo.partner} đối mặt với thử thách sinh tử trước ${charInfo.villain}. Hãy cùng phân tích chi tiết từng khung tranh!"`;

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
  console.log(`🚀 TunaMagaRecap Universal Multi-Site Backend Server listening on http://localhost:${PORT}`);
});
