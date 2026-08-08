/**
 * AIVisionEngine - Multimodal AI Manga Vision & Neural Translation Engine
 * Uses Gemini Vision & OpenAI Vision models to extract speech bubbles, clean text,
 * recognize characters, and translate manga dialog with 100% natural accuracy.
 */
import dotenv from 'dotenv';
dotenv.config();

/**
 * Clean OCR noise if using fallback engine
 */
export function cleanMangaOCRNoise(text) {
  if (!text) return '';
  let cleaned = text
    // Replace broken OCR punctuation artifacts
    .replace(/[~^`_\\|]/g, '')
    .replace(/\b[A-Za-z]\s[A-Za-z]\b/g, (m) => m.replace(/\s/, ''))
    .replace(/\s{2,}/g, ' ')
    .trim();

  // If text is short or corrupted with mostly special characters, clean it
  const validLetters = (cleaned.match(/[\p{L}\p{N}]/gu) || []).length;
  if (validLetters === 0) return '';

  return cleaned;
}

/**
 * Call Google Gemini Vision API to analyze manga page
 * Returns speech bubbles with bounding boxes, character dialog, and translations
 */
export async function analyzeMangaWithGeminiVision({ imageBase64, mimeType = 'image/jpeg', targetLang = 'vi', apiKey = '' }) {
  const key = apiKey || process.env.GEMINI_API_KEY || '';
  if (!key) {
    throw new Error('Chưa cấu hình GEMINI_API_KEY trong file .env hoặc Cài Đặt AI.');
  }

  const prompt = `You are an elite Manga/Manhwa/Webtoon OCR & Translation Expert.
Analyze this manga page image with 100% precision:
1. Detect each speech bubble, narration box, and sound effect on the image.
2. Read the EXACT original text inside each bubble. Filter out noise or drawing lines.
3. Translate each dialogue into natural, fluent ${targetLang === 'vi' ? 'Tiếng Việt (phong cách truyện tranh Việt Nam như Solo Leveling)' : targetLang}.
4. Provide the bounding box {x, y, w, h} as integer percentages (0-100) relative to image size.
5. Identify the speaker name (e.g., Sung Jinwoo, Thợ Săn, Hệ Thống, Dẫn Chuyện).
6. Write a 1-sentence engaging recap narration summary for this page for YouTube/TikTok recap video voiceover.

Return ONLY a valid JSON object in this exact schema with no markdown formatting:
{
  "detectedLanguage": "ko",
  "pageSummary": "Tóm tắt diễn biến hấp dẫn của trang này cho video recap",
  "panels": [
    {
      "speaker": "Sung Jinwoo",
      "textType": "DIALOGUE",
      "originalText": "Tên tôi là Sung Jinwoo. Thợ săn cấp E.",
      "translatedText": "Tên tôi là Sung Jinwoo. Thợ săn cấp E.",
      "bbox": { "x": 15, "y": 20, "w": 40, "h": 25 },
      "emotion": "excited"
    }
  ]
}`;

  const MODEL_CANDIDATES = [
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
  ];

  let lastError = null;

  for (const model of MODEL_CANDIDATES) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    try {
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
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const cleanJson = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
        console.log(`[Gemini Vision] ✅ Success using model: ${model}!`);
        return JSON.parse(cleanJson);
      } else {
        const errText = await response.text();
        lastError = new Error(`${model}: ${response.status} - ${errText}`);
      }
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error('Không thể kết nối với các mô hình Gemini Vision.');
}

/**
 * Neural Manga Translation with Gemini AI
 */
export async function translateMangaWithGemini({ dialogues = [], targetLang = 'vi', apiKey = '' }) {
  const key = apiKey || process.env.GEMINI_API_KEY || '';
  if (!key || dialogues.length === 0) return dialogues;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

  const prompt = `You are a professional Manga/Manhwa translator.
Translate the following manga dialogues into natural, highly immersive ${targetLang === 'vi' ? 'Tiếng Việt' : targetLang}.
Rules:
- Keep character emotions and comic nuances.
- If text contains broken OCR symbols, infer the intended manga dialogue and clean it up.
- Return ONLY a JSON array of strings in the exact same order.

Dialogues to translate:
${JSON.stringify(dialogues.map((d) => d.originalText || d.text || ''))}
`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const clean = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      const translatedArray = JSON.parse(clean);
      if (Array.isArray(translatedArray)) {
        return dialogues.map((d, i) => ({
          ...d,
          translatedText: translatedArray[i] || d.translatedText || d.text,
          text: translatedArray[i] || d.text,
        }));
      }
    }
  } catch (err) {
    console.error('[Gemini Translate] Error:', err.message);
  }

  return dialogues;
}

export const AIVisionEngine = {
  analyzeMangaWithGeminiVision,
  cleanMangaOCRNoise,
};
