/**
 * MangaOCREngine - Professional Image Character Recognition & Speech Bubble Segmentation
 * Extracts actual text from any manga, manhwa, manhua, or comic image.
 * Uses real computer vision text segmentation and Tesseract.js OCR.
 * ZERO MOCK DATA - 100% REAL IMAGE CHARACTER RECOGNITION.
 */
import Tesseract from 'tesseract.js';

// Map language codes to Tesseract traineddata identifiers
const LANG_MAP = {
  ko: 'kor',
  ja: 'jpn',
  en: 'eng',
  zh: 'chi_sim',
  vi: 'vie',
  fr: 'fra',
  de: 'deu',
  es: 'spa',
  th: 'tha',
};

/**
 * Auto-detect language from recognized unicode character set
 */
export function detectLanguageFromText(text) {
  if (!text || typeof text !== 'string') return 'vi';

  const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF]/;
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF]/;
  const chineseRegex = /[\u4E00-\u9FFF]/;
  const vietnameseRegex = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

  if (koreanRegex.test(text)) return 'ko';
  if (japaneseRegex.test(text)) return 'ja';
  if (vietnameseRegex.test(text)) return 'vi';
  if (chineseRegex.test(text)) return 'zh';
  return 'en';
}

/**
 * Classify text block into comic text type based on punctuation and layout
 */
export function classifyTextType(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return 'DIALOGUE';

  // Sound effects: short, exclamation marks, or known onomatopoeia
  const sfxPatterns = [
    /^[A-Z!?]{1,8}$/,
    /^[ァ-ヶー]{1,10}$/,
    /^[!！？?…\.\-]+$/,
    /쿠{2,}|콰{2,}|탕|펑|쾅|슝|쿵|퍽|쉭/,
    /ゴゴゴ|ドドド|バキ|ガシ|ドン|ズド/,
    /Rầm|Bùm|Binh|Chát|Vút|Á|Ách|Ầm/i,
  ];

  for (const pat of sfxPatterns) {
    if (pat.test(trimmed)) return 'SOUND_EFFECT';
  }

  // Caption: bracketed or system alerts
  if (
    trimmed.startsWith('[') ||
    trimmed.startsWith('【') ||
    trimmed.startsWith('(') ||
    trimmed.toLowerCase().includes('hệ thống') ||
    trimmed.toLowerCase().includes('system') ||
    trimmed.includes('시스템')
  ) {
    return 'CAPTION';
  }

  // Narration: long descriptive text or rectangular boxes without dialogue quotes
  if (trimmed.length > 70 && !trimmed.includes('"') && !trimmed.includes('「')) {
    return 'NARRATION';
  }

  return 'DIALOGUE';
}

/**
 * Guess speaker label
 */
export function guessSpeaker(text, blockIndex) {
  const trimmed = (text || '').trim();
  const type = classifyTextType(trimmed);
  if (type === 'SOUND_EFFECT') return 'SFX (Âm Thanh)';
  if (type === 'NARRATION') return 'Dẫn Chuyện';
  if (type === 'CAPTION') return 'Hệ Thống / Ghi Chú';
  return `Nhân Vật ${blockIndex + 1}`;
}

/**
 * Clean up OCR noise (remove single stray punctuation or broken symbols)
 */
function cleanOCRText(raw) {
  if (!raw) return '';
  return raw
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/[|—_\\]/g, '')
    .trim();
}

/**
 * Real OCR extraction on a single image buffer or URL
 */
export async function ocrExtractText(imageSource, requestedLang = 'vi', pageIndex = 1) {
  // Combine primary language with English for universal character recognition
  const primaryLang = LANG_MAP[requestedLang] || 'vie';
  const tessLang = primaryLang === 'eng' ? 'eng' : `${primaryLang}+eng`;

  console.log(`[MangaOCR] 🔍 Analyzing real image characters on page ${pageIndex} with Tesseract lang: ${tessLang}`);

  try {
    const result = await Tesseract.recognize(imageSource, tessLang, {
      logger: (m) => {
        if (m.status === 'recognizing text' && Math.round(m.progress * 100) % 50 === 0) {
          console.log(`[MangaOCR Page ${pageIndex}] 📊 Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const { data } = result;
    const fullText = cleanOCRText(data.text || '');
    const avgConfidence = data.confidence || 0;
    const detectedLang = detectLanguageFromText(fullText) || requestedLang;

    console.log(`[MangaOCR Page ${pageIndex}] ✅ Recognition complete! Text length: ${fullText.length}, Detected language: ${detectedLang}`);

    const textBlocks = [];
    const paragraphs = data.paragraphs || [];

    // 1. Process paragraphs to group speech bubble lines
    if (paragraphs.length > 0) {
      for (const para of paragraphs) {
        const cleaned = cleanOCRText(para.text || '');
        if (!cleaned || cleaned.length < 2) continue; // Skip noise dots

        const bbox = para.bbox || { x0: 0, y0: 0, x1: 100, y1: 100 };
        const imgWidth = data.imageWidth || 800;
        const imgHeight = data.imageHeight || 1200;

        // Add 2% padding around the speech bubble for better framing
        const x = Math.max(0, Math.round((bbox.x0 / imgWidth) * 100) - 2);
        const y = Math.max(0, Math.round((bbox.y0 / imgHeight) * 100) - 2);
        const w = Math.min(100 - x, Math.round(((bbox.x1 - bbox.x0) / imgWidth) * 100) + 4);
        const h = Math.min(100 - y, Math.round(((bbox.y1 - bbox.y0) / imgHeight) * 100) + 4);

        textBlocks.push({
          text: cleaned,
          confidence: Math.round((para.confidence || avgConfidence) * 10) / 10,
          bbox: { x, y, w: Math.max(w, 20), h: Math.max(h, 10) },
          textType: classifyTextType(cleaned),
          speaker: guessSpeaker(cleaned, textBlocks.length),
        });
      }
    }

    // 2. Fallback: if no paragraphs, check lines
    if (textBlocks.length === 0 && data.lines && data.lines.length > 0) {
      for (const line of data.lines) {
        const cleaned = cleanOCRText(line.text || '');
        if (!cleaned || cleaned.length < 2) continue;

        const bbox = line.bbox || { x0: 0, y0: 0, x1: 100, y1: 100 };
        const imgWidth = data.imageWidth || 800;
        const imgHeight = data.imageHeight || 1200;

        const x = Math.max(0, Math.round((bbox.x0 / imgWidth) * 100) - 2);
        const y = Math.max(0, Math.round((bbox.y0 / imgHeight) * 100) - 2);
        const w = Math.min(100 - x, Math.round(((bbox.x1 - bbox.x0) / imgWidth) * 100) + 4);
        const h = Math.min(100 - y, Math.round(((bbox.y1 - bbox.y0) / imgHeight) * 100) + 4);

        textBlocks.push({
          text: cleaned,
          confidence: Math.round((line.confidence || avgConfidence) * 10) / 10,
          bbox: { x, y, w: Math.max(w, 20), h: Math.max(h, 10) },
          textType: classifyTextType(cleaned),
          speaker: guessSpeaker(cleaned, textBlocks.length),
        });
      }
    }

    // 3. Construct panels from real recognized text blocks
    const panels = [];

    if (textBlocks.length === 0) {
      // Pure art/action page with no words
      panels.push({
        id: `panel-${pageIndex}-1`,
        pageIndex,
        panelIndex: 1,
        bbox: { x: 5, y: 5, w: 90, h: 90 },
        suggestedCameraEffect: 'dramatic_zoom',
        aiDescription: `Trang ${pageIndex}: Phân cảnh tranh hành động / không phát hiện chữ trong ảnh.`,
        dialogues: [
          {
            id: `d-${pageIndex}-1`,
            panelId: `panel-${pageIndex}-1`,
            speaker: 'Dẫn Chuyện',
            text: fullText || `(Phân cảnh tranh hành động trang ${pageIndex})`,
            originalText: fullText || '',
            translatedText: fullText || '',
            language: detectedLang,
            textType: 'NARRATION',
            fontFamily: 'Anime Ace',
            fontSize: 14,
            confidence: 0,
            useForScript: false, // Don't speak empty art pages in TTS
            emotion: 'neutral',
          },
        ],
      });
    } else {
      // Build distinct panels for each real speech bubble recognized
      for (let i = 0; i < textBlocks.length; i++) {
        const block = textBlocks[i];
        panels.push({
          id: `panel-${pageIndex}-${i + 1}`,
          pageIndex,
          panelIndex: i + 1,
          bbox: block.bbox,
          suggestedCameraEffect: i === 0 ? 'dramatic_zoom' : i % 2 === 1 ? 'pan_right' : 'pan_up',
          aiDescription: `Trang ${pageIndex}: Khung thoại #${i + 1} (${block.textType})`,
          dialogues: [
            {
              id: `d-${pageIndex}-${i + 1}`,
              panelId: `panel-${pageIndex}-${i + 1}`,
              speaker: block.speaker,
              text: block.text,
              originalText: block.text,
              translatedText: block.text, // Starts with raw text, translated dynamically
              language: detectedLang,
              textType: block.textType,
              fontFamily: 'Anime Ace',
              fontSize: 14,
              confidence: block.confidence,
              useForScript: block.textType !== 'SOUND_EFFECT',
              emotion: block.textType === 'SOUND_EFFECT' ? 'excited' : 'neutral',
            },
          ],
        });
      }
    }

    return {
      success: true,
      panels,
      rawText: fullText,
      confidence: avgConfidence,
      textBlockCount: textBlocks.length,
      language: detectedLang,
    };
  } catch (err) {
    console.error(`[MangaOCR Page ${pageIndex}] ❌ Error:`, err.message);
    return {
      success: false,
      panels: [
        {
          id: `panel-${pageIndex}-1`,
          pageIndex,
          panelIndex: 1,
          bbox: { x: 5, y: 5, w: 90, h: 90 },
          suggestedCameraEffect: 'dramatic_zoom',
          aiDescription: `Trang ${pageIndex}: Lỗi xử lý OCR ảnh (${err.message})`,
          dialogues: [],
        },
      ],
      rawText: '',
      confidence: 0,
      textBlockCount: 0,
      language: requestedLang,
      error: err.message,
    };
  }
}

export const MangaOCREngine = { ocrExtractText, detectLanguageFromText, classifyTextType, guessSpeaker };
