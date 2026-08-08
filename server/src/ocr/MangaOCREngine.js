/**
 * MangaOCREngine - Real OCR text extraction from manga page images
 * Uses Tesseract.js v5 for actual character recognition
 * Supports: Korean, Japanese, English, Chinese, Vietnamese, etc.
 */
import Tesseract from 'tesseract.js';

// Map our language codes to Tesseract language data codes
const LANG_MAP = {
  ko: 'kor',        // Korean
  ja: 'jpn',        // Japanese
  en: 'eng',        // English
  zh: 'chi_sim',    // Chinese Simplified
  vi: 'vie',        // Vietnamese
  fr: 'fra',        // French
  de: 'deu',        // German
  es: 'spa',        // Spanish
  th: 'tha',        // Thai
};

// Classify text type based on content patterns
function classifyTextType(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return 'DIALOGUE';

  // Sound effects: short, usually uppercase/katakana/onomatopoeia
  const sfxPatterns = [
    /^[A-Z!?]{1,6}$/,           // English SFX like "BOOM", "CRASH"
    /^[ァ-ヶー]{1,8}$/,          // Katakana SFX
    /^[!！？?]+$/,               // Just punctuation
    /쿠{2,}|콰{2,}|탕|펑|쾅|슝/,  // Korean SFX
    /ゴゴゴ|ドドド|バキ|ガシ/,      // Japanese SFX
  ];
  for (const pat of sfxPatterns) {
    if (pat.test(trimmed)) return 'SOUND_EFFECT';
  }

  // Narration: longer text without quotes, often descriptive
  if (trimmed.length > 80 && !trimmed.includes('"') && !trimmed.includes('「')) {
    return 'NARRATION';
  }

  // Caption: text in brackets or system-like messages
  if (trimmed.startsWith('[') || trimmed.startsWith('【') || trimmed.includes('시스템') || trimmed.includes('System')) {
    return 'CAPTION';
  }

  return 'DIALOGUE';
}

// Guess speaker based on text position and content
function guessSpeaker(text, blockIndex) {
  const trimmed = (text || '').trim();
  const type = classifyTextType(trimmed);
  if (type === 'SOUND_EFFECT') return 'SFX';
  if (type === 'NARRATION') return 'Dẫn Chuyện';
  if (type === 'CAPTION') return 'Hệ Thống';
  return `Nhân Vật ${blockIndex + 1}`;
}

/**
 * Run real OCR on a manga page image
 * @param {Buffer|string} imageSource - Image buffer or URL
 * @param {string} lang - Language code (ko, ja, en, zh, vi, etc.)
 * @param {number} pageIndex - Page number for labeling
 * @returns {Promise<{panels: Array, rawText: string, confidence: number}>}
 */
export async function ocrExtractText(imageSource, lang = 'ko', pageIndex = 1) {
  const tessLang = LANG_MAP[lang] || 'eng';

  console.log(`[MangaOCR] 🔍 Running Tesseract OCR on page ${pageIndex} with language: ${tessLang}`);

  try {
    const result = await Tesseract.recognize(imageSource, tessLang, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          // Log progress occasionally
          if (Math.round(m.progress * 100) % 25 === 0) {
            console.log(`[MangaOCR] 📊 OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      },
    });

    const { data } = result;
    const fullText = (data.text || '').trim();
    const avgConfidence = data.confidence || 0;

    console.log(`[MangaOCR] ✅ OCR Complete! Confidence: ${avgConfidence.toFixed(1)}%, Characters: ${fullText.length}`);

    // Group text blocks from Tesseract paragraphs/lines
    const textBlocks = [];
    const paragraphs = data.paragraphs || [];

    if (paragraphs.length > 0) {
      for (const para of paragraphs) {
        const paraText = (para.text || '').trim();
        if (!paraText || paraText.length < 2) continue; // Skip noise

        const bbox = para.bbox || { x0: 0, y0: 0, x1: 100, y1: 100 };
        const imgWidth = data.imageWidth || 800;
        const imgHeight = data.imageHeight || 1200;

        textBlocks.push({
          text: paraText,
          confidence: para.confidence || avgConfidence,
          bbox: {
            x: Math.round((bbox.x0 / imgWidth) * 100),
            y: Math.round((bbox.y0 / imgHeight) * 100),
            w: Math.round(((bbox.x1 - bbox.x0) / imgWidth) * 100),
            h: Math.round(((bbox.y1 - bbox.y0) / imgHeight) * 100),
          },
          textType: classifyTextType(paraText),
          speaker: guessSpeaker(paraText, textBlocks.length),
        });
      }
    }

    // Fallback: if no paragraphs, try lines
    if (textBlocks.length === 0 && data.lines && data.lines.length > 0) {
      for (const line of data.lines) {
        const lineText = (line.text || '').trim();
        if (!lineText || lineText.length < 2) continue;

        const bbox = line.bbox || { x0: 0, y0: 0, x1: 100, y1: 100 };
        const imgWidth = data.imageWidth || 800;
        const imgHeight = data.imageHeight || 1200;

        textBlocks.push({
          text: lineText,
          confidence: line.confidence || avgConfidence,
          bbox: {
            x: Math.round((bbox.x0 / imgWidth) * 100),
            y: Math.round((bbox.y0 / imgHeight) * 100),
            w: Math.round(((bbox.x1 - bbox.x0) / imgWidth) * 100),
            h: Math.round(((bbox.y1 - bbox.y0) / imgHeight) * 100),
          },
          textType: classifyTextType(lineText),
          speaker: guessSpeaker(lineText, textBlocks.length),
        });
      }
    }

    // Fallback: if still no blocks, use full text as one block
    if (textBlocks.length === 0 && fullText.length > 0) {
      textBlocks.push({
        text: fullText,
        confidence: avgConfidence,
        bbox: { x: 5, y: 5, w: 90, h: 90 },
        textType: classifyTextType(fullText),
        speaker: guessSpeaker(fullText, 0),
      });
    }

    // Build panels from text blocks (group nearby blocks into panels)
    const panels = [];
    if (textBlocks.length === 0) {
      // No text found - create empty panel
      panels.push({
        id: `panel-${pageIndex}-1`,
        pageIndex,
        panelIndex: 1,
        bbox: { x: 5, y: 5, w: 90, h: 90 },
        suggestedCameraEffect: 'dramatic_zoom',
        aiDescription: `Trang ${pageIndex}: Không phát hiện văn bản. Có thể là trang ảnh minh họa hoặc trang trắng.`,
        dialogues: [],
      });
    } else {
      // Create one panel per text block for maximum accuracy
      for (let i = 0; i < textBlocks.length; i++) {
        const block = textBlocks[i];
        panels.push({
          id: `panel-${pageIndex}-${i + 1}`,
          pageIndex,
          panelIndex: i + 1,
          bbox: block.bbox,
          suggestedCameraEffect: i === 0 ? 'dramatic_zoom' : 'pan_right',
          aiDescription: `Trang ${pageIndex}: Vùng văn bản #${i + 1} - ${block.textType}.`,
          dialogues: [
            {
              id: `d-${pageIndex}-${i + 1}`,
              panelId: `panel-${pageIndex}-${i + 1}`,
              speaker: block.speaker,
              text: block.text,
              originalText: block.text,
              translatedText: '',  // Will be filled by translation
              language: lang,
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
      panels,
      rawText: fullText,
      confidence: avgConfidence,
      textBlockCount: textBlocks.length,
      language: lang,
    };
  } catch (err) {
    console.error(`[MangaOCR] ❌ OCR Error:`, err.message);

    // Return empty result on error
    return {
      panels: [
        {
          id: `panel-${pageIndex}-1`,
          pageIndex,
          panelIndex: 1,
          bbox: { x: 5, y: 5, w: 90, h: 90 },
          suggestedCameraEffect: 'dramatic_zoom',
          aiDescription: `Trang ${pageIndex}: Lỗi OCR - ${err.message}`,
          dialogues: [],
        },
      ],
      rawText: '',
      confidence: 0,
      textBlockCount: 0,
      language: lang,
      error: err.message,
    };
  }
}

export const MangaOCREngine = { ocrExtractText };
