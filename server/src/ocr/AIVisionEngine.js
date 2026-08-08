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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

  const prompt = `You are a professional Manga/Manhwa/Comic OCR, Vision Analyzer, and Story Recap Writer.
Analyze this manga page image with extreme precision.

Tasks:
1. Detect all speech bubbles, narration boxes, and sound effects on the image.
2. Extract the EXACT original text inside each bubble (Korean, Japanese, English, Chinese, or Vietnamese).
3. Translate each text into target language: "${targetLang}" (Vietnamese if vi, English if en, etc.) with natural comic tone.
4. Estimate bounding box {x, y, w, h} as percentages (0-100) on the image for each speech bubble.
5. Identify speaker and textType (DIALOGUE, NARRATION, SOUND_EFFECT, CAPTION).
6. Write a 1-sentence engaging recap narration summary for this page for YouTube/TikTok recap video voiceover.

Return ONLY a valid JSON object in this exact schema with no markdown formatting:
{
  "detectedLanguage": "ko" | "ja" | "en" | "zh" | "vi",
  "pageSummary": "Sentence explaining what happens on this page for video narrator",
  "panels": [
    {
      "speaker": "Name of character or Dẫn Chuyện",
      "textType": "DIALOGUE" | "NARRATION" | "SOUND_EFFECT" | "CAPTION",
      "originalText": "Exact text in image",
      "translatedText": "Natural translation in ${targetLang}",
      "bbox": { "x": 10, "y": 15, "w": 40, "h": 25 },
      "emotion": "excited" | "fear" | "angry" | "neutral"
    }
  ]
}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        response_mime_type: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(rawJson);
}

export const AIVisionEngine = {
  analyzeMangaWithGeminiVision,
  cleanMangaOCRNoise,
};
