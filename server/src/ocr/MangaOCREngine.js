/**
 * MangaOCREngine - Professional Image Character Recognition & Speech Bubble Segmentation
 * Features:
 * - Real image dimension reading via Sharp metadata (accurate bounding boxes)
 * - Strict single-language OCR selection without diluted +eng split
 * - Unicode-aware text cleaning preserving single CJK characters, stats (Lv.10), and manga punctuation (?, !, ...)
 * - Resilient Tesseract.js v5/v6 block & paragraph traversal
 */
import Tesseract from 'tesseract.js';
import sharp from 'sharp';

/**
 * Get accurate image dimensions and preprocess image for OCR
 */
async function inspectAndPreprocessMangaImage(imageBuffer) {
  try {
    if (!Buffer.isBuffer(imageBuffer)) {
      return { buffer: imageBuffer, width: 1000, height: 1500 };
    }
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const width = metadata.width || 1000;
    const height = metadata.height || 1500;

    // Grayscale, normalize contrast, and sharpen text edges
    const processedBuffer = await image
      .grayscale()
      .normalize()
      .sharpen({ sigma: 1.2 })
      .toBuffer();

    return { buffer: processedBuffer, width, height };
  } catch (err) {
    console.error('[MangaOCR] Preprocess error:', err.message);
    return { buffer: imageBuffer, width: 1000, height: 1500 };
  }
}

// Map language codes to pure Tesseract traineddata identifiers
const LANG_MAP = {
  ko: 'kor',
  ja: 'jpn',
  zh: 'chi_sim',
  vi: 'vie',
  en: 'eng',
  fr: 'fra',
  de: 'deu',
  es: 'spa',
  th: 'tha',
};

/**
 * Auto-detect language from recognized unicode character set
 */
export function detectLanguageFromText(text) {
  if (!text || typeof text !== 'string') return 'ko';

  const koreanRegex = /[\uAC00-\uD7AF\u1100-\u11FF]/;
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF]/;
  const chineseRegex = /[\u4E00-\u9FFF]/;
  const vietnameseRegex = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

  if (koreanRegex.test(text)) return 'ko';
  if (japaneseRegex.test(text)) return 'ja';
  if (chineseRegex.test(text)) return 'zh';
  if (vietnameseRegex.test(text)) return 'vi';
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
    /^[A-Z!?！？\.\-]{1,8}$/,
    /^[ァ-ヶー]{1,10}$/,
    /^[!！？?…\.\-]+$/,
    /쿠{2,}|콰{2,}|탕|펑|쾅|슝|쿵|퍽|쉭|크악|크아악/,
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

  // Narration: long descriptive text without dialogue quotes
  if (trimmed.length > 70 && !trimmed.includes('"') && !trimmed.includes('「') && !trimmed.includes('”')) {
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
 * Smart Unicode-aware OCR cleaner:
 * - Preserves single Hangul/Kanji/Kana syllables (아, 네, 何, え...)
 * - Preserves stats and levels (Lv.10, 100%, E급, S급, HP, MP)
 * - Preserves comic punctuation (?, !, ..., ?!)
 * - Strips non-text screentone noise, isolated random punctuation, and broken drawing artifacts
 */
export function cleanOCRText(raw) {
  if (!raw) return '';

  let text = raw
    .replace(/[\r\n]+/g, ' ')
    .replace(/[|—_\\\/\[\]\{\}\<\>~`^+=*#$@%&©;:]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // If text contains genuine CJK characters, keep them with punctuation
  const hasCJK = /[\uAC00-\uD7AF\u1100-\u11FF\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
  if (hasCJK) {
    return text.replace(/\s{2,}/g, ' ').trim();
  }

  // Split into tokens for Latin/Vietnamese noise filtering
  const tokens = text.split(' ');
  const cleanTokens = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i].trim();
    if (!t) continue;

    // Preserve valid single-character words in Vietnamese, English, or comic marks
    if (t.length === 1 && /^[aAàÀáÁảẢãÃạẠeEèÈéÉẻẺẽẼẹẸiIìÌíÍỉỈĩĨịỊoOòÒóÓỏỎõÕọỌuUùÙúÚủỦũŨụỤyYýÝđĐ0-9!?.\-]$/.test(t)) {
      cleanTokens.push(t);
      continue;
    }

    // Preserve stats and levels like Lv.10, E급, S-Rank
    if (/^(Lv\.?\d+|[ESDABC]급?|HP|MP|\d+%)$/i.test(t)) {
      cleanTokens.push(t);
      continue;
    }

    // Discard alphanumeric noise mixtures like Z7, 3i, VY1 unless it's a known gaming stat
    if (/\d+[a-zA-Z]+|[a-zA-Z]+\d+/.test(t) && !/^[ESDABC]\d*$/i.test(t)) {
      continue;
    }

    // Discard meaningless 2-letter noise if isolated
    if (t.length === 2 && /^(xx|ip|vy|cu|na|gg|nl|aa|nl|fb|zq)$/i.test(t)) {
      continue;
    }

    cleanTokens.push(t);
  }

  let cleaned = cleanTokens.join(' ')
    .replace(/\b([a-zA-ZÀ-ỹ])\s+([a-zA-ZÀ-ỹ])\s+([a-zA-ZÀ-ỹ])\b/g, '$1$2$3')
    .replace(/\b([a-zA-ZÀ-ỹ])\s+([a-zA-ZÀ-ỹ])\b/g, '$1$2')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // If text has no meaningful characters or punctuation, return empty
  const meaningfulChars = cleaned.replace(/[^a-zA-Z0-9À-ỹ가-힣一-龥ぁ-ゔァ-ヴー!?.]/g, '');
  if (meaningfulChars.length < 1) return '';

  return cleaned;
}

/**
 * Real OCR extraction with true image dimensions and Tesseract v5/v6 structure traversal
 */
export async function ocrExtractText(imageSource, requestedLang = 'ko', pageIndex = 1) {
  // Use pure single-language trained data to avoid diluted cross-script confusion
  const tessLang = LANG_MAP[requestedLang] || 'kor';

  console.log(`[MangaOCR] 🔍 Analyzing page ${pageIndex} with single-script model: ${tessLang}`);

  try {
    const { buffer: cleanedImage, width: imgWidth, height: imgHeight } =
      await inspectAndPreprocessMangaImage(imageSource);

    const result = await Tesseract.recognize(cleanedImage, tessLang, {
      logger: (m) => {
        if (m.status === 'recognizing text' && Math.round(m.progress * 100) % 50 === 0) {
          console.log(`[MangaOCR Page ${pageIndex}] 📊 Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const { data } = result;
    const fullText = cleanOCRText(data.text || '');
    const avgConfidence = data.confidence || 0;
    const detectedLang = detectLanguageFromText(data.text) || requestedLang;

    console.log(`[MangaOCR Page ${pageIndex}] ✅ Dimensions: ${imgWidth}x${imgHeight}, Recognized: ${fullText.length} chars, Lang: ${detectedLang}`);

    const textBlocks = [];

    // Traverse blocks -> paragraphs -> lines (compatible with all Tesseract.js versions)
    const rawBlocks = data.blocks || [];
    const rawParagraphs = data.paragraphs || [];
    const rawLines = data.lines || [];

    if (rawParagraphs.length > 0) {
      for (const para of rawParagraphs) {
        const cleaned = cleanOCRText(para.text || '');
        if (!cleaned) continue;

        const bbox = para.bbox || { x0: 0, y0: 0, x1: imgWidth, y1: imgHeight };
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
    } else if (rawLines.length > 0) {
      for (const line of rawLines) {
        const cleaned = cleanOCRText(line.text || '');
        if (!cleaned) continue;

        const bbox = line.bbox || { x0: 0, y0: 0, x1: imgWidth, y1: imgHeight };
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

    // Construct panels from recognized blocks
    const panels = [];

    if (textBlocks.length === 0) {
      // Art/action frame with no detected text
      panels.push({
        id: `panel-${pageIndex}-1`,
        pageIndex,
        panelIndex: 1,
        bbox: { x: 5, y: 5, w: 90, h: 90 },
        suggestedCameraEffect: 'dramatic_zoom',
        aiDescription: `Trang ${pageIndex}: Phân cảnh tranh hành động`,
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
            fontFamily: 'Inter',
            fontSize: 14,
            confidence: 0,
            useForScript: false,
            emotion: 'neutral',
          },
        ],
      });
    } else {
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
              translatedText: block.text,
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

    // Always append 1 dedicated Narration panel for video recap scriptwriting
    panels.push({
      id: `panel-${pageIndex}-narration`,
      pageIndex,
      panelIndex: panels.length + 1,
      bbox: { x: 5, y: 75, w: 90, h: 20 },
      suggestedCameraEffect: 'pan_down',
      aiDescription: `Trang ${pageIndex}: Lời dẫn chuyện & Kịch bản Recap Video (AI Content Generator)`,
      dialogues: [
        {
          id: `d-${pageIndex}-narr`,
          panelId: `panel-${pageIndex}-narration`,
          speaker: 'Dẫn Chuyện',
          text: `[Dẫn truyện Trang ${pageIndex}]: Tóm tắt diễn biến kịch tính phân cảnh trang này...`,
          originalText: `[Dẫn truyện Trang ${pageIndex}]`,
          translatedText: `[Dẫn truyện Trang ${pageIndex}]: Tóm tắt diễn biến kịch tính phân cảnh trang này...`,
          language: detectedLang,
          textType: 'NARRATION',
          fontFamily: 'Inter',
          fontSize: 14,
          confidence: 1.0,
          useForScript: true,
          emotion: 'excited',
        },
      ],
    });

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
