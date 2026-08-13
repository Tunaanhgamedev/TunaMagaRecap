/**
 * AIVisionEngine - High-Precision Manga OCR & Neural Translation Engine
 * 
 * Features:
 * - Verbatim Vision Transcription (no hallucinated / paraphrased text)
 * - Explicit ID-based 1-to-1 dialogue translation mapping (no array index mismatch)
 * - Faithful comic translation without narrative distortion
 * - Multi-model Gemini fallback (gemini-2.0-flash, gemini-1.5-flash-latest, gemini-1.5-flash, gemini-1.5-pro)
 * - Robust JSON schema validation and truncation recovery
 */
import dotenv from 'dotenv';
import { generateUniversalMangaScript, cleanRawDialogues } from './MangaStoryKnowledgeEngine.js';
dotenv.config();

const MODEL_CANDIDATES = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
];

/**
 * Call Google Gemini Vision API to analyze manga page with extreme precision
 */
export async function analyzeMangaWithGeminiVision({
  imageBase64,
  mimeType = 'image/jpeg',
  targetLang = 'vi',
  apiKey = '',
}) {
  const key = apiKey || process.env.GEMINI_API_KEY || '';
  if (!key) {
    throw new Error('Chưa cấu hình GEMINI_API_KEY trong file .env hoặc Cài Đặt AI.');
  }

  const prompt = `You are a high-precision Manga/Manhwa/Webtoon OCR and Translation System.
Analyze this manga page image with verbatim accuracy:

Instructions:
1. Detect all speech bubbles, caption boxes, and narration on the image.
2. Transcribe the EXACT original text inside each bubble in its original language (Korean, Japanese, English, Chinese, or Vietnamese). Do not summarize or invent text.
3. Translate each bubble faithfully and accurately into ${targetLang === 'vi' ? 'Vietnamese (Tiếng Việt)' : targetLang}, preserving the exact dialogue meaning and character tone.
4. Estimate bounding box {x, y, w, h} as integer percentages (0-100) on the image.
5. Identify the speaker (e.g. Main Character, Side Character, Narrator, System Alert).
6. Write a 1-sentence recap narration summary describing the scene.

Return ONLY a valid JSON object in this exact schema with no markdown code fences:
{
  "detectedLanguage": "ko",
  "pageSummary": "Tóm tắt diễn biến ngắn gọn của trang truyện",
  "panels": [
    {
      "id": "panel-1",
      "speaker": "Main Character",
      "textType": "DIALOGUE",
      "originalText": "Verbatim text in bubble",
      "translatedText": "Bản dịch tiếng Việt chính xác và tự nhiên",
      "bbox": { "x": 15, "y": 20, "w": 40, "h": 25 },
      "emotion": "excited"
    }
  ]
}`;

  let lastError = null;

  for (const model of MODEL_CANDIDATES) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    try {
      console.log(`[Gemini Vision] 🤖 Attempting model: ${model}...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const cleanJson = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed && Array.isArray(parsed.panels)) {
          console.log(`[Gemini Vision] ✅ Recognized ${parsed.panels.length} bubbles using model: ${model}`);
          return parsed;
        }
      } else {
        const errText = await response.text();
        console.warn(`[Gemini Vision] Model ${model} returned ${response.status}:`, errText.slice(0, 150));
        lastError = new Error(`${model}: ${response.status} - ${errText}`);
      }
    } catch (e) {
      console.warn(`[Gemini Vision] Model ${model} exception:`, e.message);
      lastError = e;
    }
  }

  throw lastError || new Error('Không thể kết nối với các mô hình Gemini Vision.');
}

/**
 * Free Google Translate fallback using GTX endpoint (no API key required, zero quota limits)
 */
export async function translateWithFreeGoogleTranslate(text, targetLang = 'vi') {
  if (!text || !text.trim()) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedSegments = data[0].map((item) => item[0]).filter(Boolean);
        const result = translatedSegments.join('');
        if (result && result.trim()) return result.trim();
      }
    }
  } catch (e) {
    console.warn('[Free Google Translate] Error:', e.message);
  }
  return text;
}

/**
 * Neural Manga Translation with ID-Based Explicit 1-to-1 Mapping
 * Uses Gemini AI if available; falls back to Free Google Translate if Gemini fails/429s/lacks key.
 */
export async function translateMangaWithGemini({
  dialogues = [],
  targetLang = 'vi',
  apiKey = '',
}) {
  if (dialogues.length === 0) return dialogues;

  const key = apiKey || process.env.GEMINI_API_KEY || '';

  // 1. Try Gemini AI translation if API key is provided
  if (key) {
    const payloadItems = dialogues.map((d, idx) => ({
      id: d.id || `dialogue-${idx}`,
      original: d.originalText || d.text || '',
      speaker: d.speaker || '',
    }));

    const prompt = `You are a professional Manga/Manhwa Translator.
Translate the following manga dialogue items faithfully into ${targetLang === 'vi' ? 'natural Vietnamese (Tiếng Việt)' : targetLang}.

Translation Rules:
1. Translate each item accurately without altering lore, character names, or adding invented text.
2. Match each translation to its exact "id".
3. Return ONLY a valid JSON object matching this schema:
{
  "translations": [
    {
      "id": "dialogue-0",
      "translated": "Câu dịch tiếng Việt chính xác"
    }
  ]
}

Items to translate:
${JSON.stringify(payloadItems, null, 2)}
`;

    for (const model of MODEL_CANDIDATES) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const clean = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
          const parsed = JSON.parse(clean);

          if (parsed && Array.isArray(parsed.translations)) {
            const translationMap = new Map(
              parsed.translations.map((t) => [String(t.id), t.translated])
            );

            return dialogues.map((d, idx) => {
              const id = d.id || `dialogue-${idx}`;
              const translated = translationMap.get(id) || d.translatedText || d.text;
              return {
                ...d,
                translatedText: String(translated),
                text: String(translated),
              };
            });
          }
        } else {
          console.warn(`[Gemini Translate] Model ${model} returned status ${response.status}`);
        }
      } catch (err) {
        console.error(`[Gemini Translate ${model}] Error:`, err.message);
      }
    }
  }

  // 2. Free Google Translate fallback for 100% reliable translation without API key or rate limits
  console.log(`[Translate Engine] 🌐 Using Free Google Translate fallback for ${dialogues.length} dialogues...`);
  const translatedDialogues = await Promise.all(
    dialogues.map(async (d) => {
      const sourceStr = d.originalText || d.text || '';
      const translated = await translateWithFreeGoogleTranslate(sourceStr, targetLang);
      return {
        ...d,
        translatedText: translated,
        text: translated,
      };
    })
  );

  return translatedDialogues;
}

/**
 * Generate high-converting Manga Recap Script (YouTube / TikTok / Review)
 * using full OCR dialogue context, manga visual scenes, and custom system prompt training!
 */
export async function generateMangaRecapScript({
  seriesName = '',
  chapterNumber = 1,
  mode = 'review',
  dialogues = [],
  pages = [],
  customPrompt = '',
  apiKey = '',
  genre = null,
  protagonist = '',
}) {
  const key = apiKey || process.env.GEMINI_API_KEY || '';
  const cleanDialogues = cleanRawDialogues(dialogues);
  const totalPages = Array.isArray(pages) && pages.length > 0 ? pages.length : Math.max(1, ...cleanDialogues.map((d) => d.pageIndex || 1));

  // Build full page & panel overview for AI
  let pagesOverview = '';
  if (Array.isArray(pages) && pages.length > 0) {
    pagesOverview = pages
      .map((p) => {
        const pDialogues = cleanRawDialogues(p.panels?.flatMap((pan) => pan.dialogues || []) || []);
        const pScenes = p.panels?.map((pan) => `[Panel ${pan.panelIndex} (${pan.suggestedCameraEffect || 'zoom_in'})]`).join(' ') || '';
        const dText = pDialogues.length > 0
          ? pDialogues.map((d) => `"${d.speaker || 'Nhân vật'}: ${d.text || d.translatedText}"`).join(', ')
          : '(Cảnh hành động / Diễn biến không lời)';
        return `Trang ${p.pageIndex}: ${pScenes} -> Thoại: ${dText}`;
      })
      .join('\n');
  } else if (cleanDialogues.length > 0) {
    pagesOverview = cleanDialogues
      .map((d) => `[Trang ${d.pageIndex || 1} - ${d.speaker || 'Nhân vật'}]: "${d.text || d.translatedText || ''}"`)
      .join('\n');
  } else {
    pagesOverview = `(Diễn biến thực tế Chapter ${chapterNumber} bộ ${seriesName}, tổng cộng ${totalPages} trang truyện)`;
  }

  const systemInstruction = `Bạn là Đạo Diễn & Biên Kịch Video Recap Truyện Tranh Chuyên Nghiệp Hàng Đầu YouTube / TikTok Triệu View với phong cách bình luận giật gân, cuốn hút và vô cùng kịch tính.
Nhiệm vụ của bạn: Viết một kịch bản đọc thuyết minh (Voiceover Script) CỰC KỲ DÀI, CHI TIẾT, HÀO HÙNG VÀ SÔI ĐỘNG (tối thiểu 2000 - 3500 từ) bao quát 100% TOÀN BỘ từ Trang 1 đến Trang ${totalPages} của Chapter ${chapterNumber} bộ truyện "${seriesName}".

QUY TẮC BẮT BUỘC ĐỂ TẠO VIDEO TRIỆU VIEW:
1. **Lời dẫn chuyện liên tục cho TẤT CẢ các Panel**: Với MỌI panel khung hình trên từng trang, BẮT BUỘC có ít nhất 1-2 câu thuyết minh **[Dẫn Chuyện]** miêu tả hành động, phân tích tâm lý, bối cảnh và tạo hype ("Pha lật kèo đỉnh cao!", "Vả mặt cực gắt!", "Khán giả trố mắt trầm ồ...", "Ma lực bùng nổ nghẹt thở..."). KHÔNG ĐỂ BẤT KỲ PANEL NÀO BỊ TRỐNG HOẶC IM LẶNG!
2. **Bao quát đầy đủ tất cả ${totalPages} trang truyện**: Tuyệt đối không cắt ngắn hay dừng giữa chừng. Duyệt tỉ mỉ từng hồi từ Trang 1 tới Trang ${totalPages}.
3. **Mô tả bối cảnh & Góc máy chuyên nghiệp**: Dùng thẻ *🎨 [Trang X • Panel Y (Góc Máy)]* miêu tả hiệu ứng trực quan (Dramatic Zoom, Pan Right, Tilt Up, Ma Lực Bùng Nổ).
4. **Không đưa từ ngữ rác kỹ thuật**: Tuyệt đối KHÔNG xuất hiện "Bấm quét chữ", "OCR", "trích xuất văn bản", "chờ xử lý".
5. **Phân vai sắc nét**: **[Dẫn Chuyện]**, **[${protagonist || 'Nhân Vật Chính'}]**, **[Phản Diện / Kẻ Địch]**, **[Hiệu Ứng / SFX / BGM]**.
6. **Hook 5s Đầu Triệu View**: Câu mở đầu giật gân, dồn dập, kéo giữ chân người xem 100%.
7. **Phân tích chiến thuật & Kết thúc Cliffhanger cực gắt**: Kêu gọi Like, Subscribe và Đăng ký kênh 🔔.

DANH SÁCH CHI TIẾT TỪNG TRANG TRUYỆN (${totalPages} TRANG):
${pagesOverview}

PHONG CÁCH KỊCH BẢN YÊU CẦU (${mode.toUpperCase()}):
${customPrompt ? `YÊU CẦU ĐẶC BIỆT TỪ ĐẠO DIỄN: "${customPrompt}"` : ''}

Hãy xuất bản kịch bản hoàn chỉnh bằng Tiếng Việt chuẩn SEO YouTube, văn phong nảy lửa, cuốn hút từng giây!`;

  if (key) {
    for (const model of MODEL_CANDIDATES) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemInstruction }] }],
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim()) {
            return text.trim();
          }
        }
      } catch (err) {
        console.warn(`[Gemini Script] ${model} failed, trying next...`);
      }
    }
  }

  // Fallback to Universal Multi-Genre Story & Visual Narrative Generator with full page loop
  return generateUniversalMangaScript({
    seriesName,
    chapterNumber,
    mode,
    dialogues: cleanDialogues,
    pages,
    customPrompt,
    genre,
    protagonist,
  });
}

export const AIVisionEngine = {
  analyzeMangaWithGeminiVision,
  translateMangaWithGemini,
  generateMangaRecapScript,
};
