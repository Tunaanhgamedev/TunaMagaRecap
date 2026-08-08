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

    // Upscale small images to help Tesseract read dense speech bubble glyphs
    const targetWidth = width < 1500 ? width * 2 : width;

    // Grayscale, normalize contrast, and apply gentle sharpening (sigma 0.5 to prevent edge halos/diacritic distortion)
    const processedBuffer = await image
      .resize({ width: Math.round(targetWidth) })
      .grayscale()
      .normalize()
      .sharpen({ sigma: 0.5 })
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
 * Fast low-cost pass to sniff actual script before committing to a full-language OCR run.
 * Uses eng traineddata (reads Latin glyphs without Hangul-matching bias), PSM 6 (single uniform block).
 * detectLanguageFromText() then checks the Unicode ranges of what eng actually read.
 */
async function sniffScript(imageBuffer, candidateLang) {
  try {
    const { data } = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: () => {}, // silent
    });
    const sample = (data.text || '').trim();
    if (sample.length < 3) return candidateLang; // too little signal, trust caller
    const detected = detectLanguageFromText(sample);
    return detected;
  } catch {
    return candidateLang; // sniff failed, trust caller
  }
}

/**
 * Cluster OCR text lines into tightly-fitted speech bubble bounding boxes
 */
function clusterLinesToSpeechBubbles(rawLines, imgWidth, imgHeight, avgConfidence) {
  const validLines = [];
  for (const line of rawLines) {
    const cleaned = cleanOCRText(line.text || '');
    if (!cleaned) continue;
    
    // Filter out low confidence noise lines (art strokes, blood, screentone)
    const conf = line.confidence || avgConfidence;
    if (conf < 40 && cleaned.length < 5) continue;

    const bbox = line.bbox || { x0: 0, y0: 0, x1: imgWidth, y1: imgHeight };
    const lh = bbox.y1 - bbox.y0;

    // Filter out huge full-page spanning blocks (>40% page height)
    if (lh > imgHeight * 0.4) continue;

    validLines.push({
      text: cleaned,
      confidence: conf,
      x0: bbox.x0,
      y0: bbox.y0,
      x1: bbox.x1,
      y1: bbox.y1,
    });
  }

  if (validLines.length === 0) return [];

  // Group lines if vertical gap < 3.5% of page height and horizontal alignment overlap
  const clusters = [];
  const visited = new Set();

  for (let i = 0; i < validLines.length; i++) {
    if (visited.has(i)) continue;
    const currentCluster = [validLines[i]];
    visited.add(i);

    let addedMore = true;
    while (addedMore) {
      addedMore = false;
      for (let j = 0; j < validLines.length; j++) {
        if (visited.has(j)) continue;

        const candidate = validLines[j];
        const isNear = currentCluster.some((member) => {
          const vertDist = Math.max(0, Math.max(member.y0, candidate.y0) - Math.min(member.y1, candidate.y1));
          const horizOverlap = Math.min(member.x1, candidate.x1) - Math.max(member.x0, candidate.x0);
          const maxW = Math.max(member.x1 - member.x0, candidate.x1 - candidate.x0);
          return vertDist < imgHeight * 0.035 && horizOverlap > -maxW * 0.4;
        });

        if (isNear) {
          currentCluster.push(candidate);
          visited.add(j);
          addedMore = true;
        }
      }
    }

    clusters.push(currentCluster);
  }

  // Sort clusters top-to-bottom
  clusters.sort((a, b) => {
    const minYA = Math.min(...a.map((l) => l.y0));
    const minYB = Math.min(...b.map((l) => l.y0));
    return minYA - minYB;
  });

  // Convert clusters into tight speech bubble bounding boxes
  return clusters.map((cluster, cIdx) => {
    const x0 = Math.min(...cluster.map((l) => l.x0));
    const y0 = Math.min(...cluster.map((l) => l.y0));
    const x1 = Math.max(...cluster.map((l) => l.x1));
    const y1 = Math.max(...cluster.map((l) => l.y1));

    const combinedText = cluster.map((l) => l.text).join(' ');
    const avgConf = cluster.reduce((sum, l) => sum + l.confidence, 0) / cluster.length;

    // Relative percentage coordinates padded tightly around text (+-1%)
    const x = Math.max(0, Math.round((x0 / imgWidth) * 100) - 1);
    const y = Math.max(0, Math.round((y0 / imgHeight) * 100) - 1);
    const w = Math.min(100 - x, Math.round(((x1 - x0) / imgWidth) * 100) + 2);
    const h = Math.min(100 - y, Math.round(((y1 - y0) / imgHeight) * 100) + 2);

    return {
      text: combinedText,
      confidence: Math.round(avgConf * 10) / 10,
      bbox: { x, y, w: Math.max(w, 15), h: Math.max(h, 4) },
      textType: classifyTextType(combinedText),
      speaker: guessSpeaker(combinedText, cIdx),
    };
  });
}

/**
 * Real OCR extraction with script-sniffing, line-clustering speech bubble segmentation, and Tesseract v5/v6 structure traversal.
 */
export async function ocrExtractText(imageSource, requestedLang = 'ko', pageIndex = 1) {
  try {
    const { buffer: cleanedImage, width: imgWidth, height: imgHeight } =
      await inspectAndPreprocessMangaImage(imageSource);

    // --- Sniff actual script before locking in the traineddata ---
    const sniffed = await sniffScript(cleanedImage, requestedLang);
    const effectiveLang = sniffed !== requestedLang ? sniffed : requestedLang;
    const tessLang = LANG_MAP[effectiveLang] || 'kor';

    if (effectiveLang !== requestedLang) {
      console.log(`[MangaOCR] ⚠️ Requested ${requestedLang} but sniffed ${effectiveLang} — switching traineddata to ${tessLang} to avoid glyph-mismatch garbage`);
    }

    console.log(`[MangaOCR] 🔍 Analyzing page ${pageIndex} with single-script model: ${tessLang} (sniffed: ${sniffed}, requested: ${requestedLang})`);

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
    // Post-OCR detection uses raw text (before cleaning) to catch diacritics that cleanOCRText might strip
    const detectedLang = detectLanguageFromText(data.text) || effectiveLang;

    console.log(`[MangaOCR Page ${pageIndex}] ✅ Dimensions: ${imgWidth}x${imgHeight}, Recognized: ${fullText.length} chars, Lang: ${detectedLang}`);

    const rawLines = data.lines || [];
    const rawParagraphs = data.paragraphs || [];

    // 1. First attempt tight line-clustering into distinct speech bubbles
    let textBlocks = clusterLinesToSpeechBubbles(rawLines, imgWidth, imgHeight, avgConfidence);

    // 2. Fallback to paragraph blocks if clustering yielded no blocks
    if (textBlocks.length === 0 && rawParagraphs.length > 0) {
      for (const para of rawParagraphs) {
        const cleaned = cleanOCRText(para.text || '');
        if (!cleaned) continue;

        const bbox = para.bbox || { x0: 0, y0: 0, x1: imgWidth, y1: imgHeight };
        const ph = bbox.y1 - bbox.y0;
        if (ph > imgHeight * 0.6) continue; // Skip huge full-page merged paragraphs

        const x = Math.max(0, Math.round((bbox.x0 / imgWidth) * 100) - 1);
        const y = Math.max(0, Math.round((bbox.y0 / imgHeight) * 100) - 1);
        const w = Math.min(100 - x, Math.round(((bbox.x1 - bbox.x0) / imgWidth) * 100) + 2);
        const h = Math.min(100 - y, Math.round(((bbox.y1 - bbox.y0) / imgHeight) * 100) + 2);

        textBlocks.push({
          text: cleaned,
          confidence: Math.round((para.confidence || avgConfidence) * 10) / 10,
          bbox: { x, y, w: Math.max(w, 20), h: Math.max(h, 6) },
          textType: classifyTextType(cleaned),
          speaker: guessSpeaker(cleaned, textBlocks.length),
        });
      }
    }

    // Construct panels from recognized blocks
    const panels = [];

    // Filter out garbled noise blocks (e.g., blood drops or art strokes misrecognized as symbols)
    function isNoiseText(text) {
      if (!text || text.trim().length < 2) return true;
      const letters = text.match(/[\p{L}\p{N}]/gu) || [];
      // If fewer than 35% characters are letters/numbers and string is non-trivial, it's drawing noise
      if (letters.length / text.length < 0.35 && text.length > 4) return true;
      return false;
    }

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
      let panelCount = 0;
      for (let i = 0; i < textBlocks.length; i++) {
        const block = textBlocks[i];
        if (isNoiseText(block.text)) {
          console.log(`[MangaOCR Page ${pageIndex}] 🧹 Filtered out art noise block: "${block.text}"`);
          continue;
        }
        panelCount++;
        panels.push({
          id: `panel-${pageIndex}-${panelCount}`,
          pageIndex,
          panelIndex: panelCount,
          bbox: block.bbox,
          suggestedCameraEffect: panelCount === 1 ? 'dramatic_zoom' : panelCount % 2 === 0 ? 'pan_right' : 'pan_up',
          aiDescription: `Trang ${pageIndex}: Khung thoại #${panelCount} (${block.textType})`,
          dialogues: [
            {
              id: `d-${pageIndex}-${panelCount}`,
              panelId: `panel-${pageIndex}-${panelCount}`,
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
          text: `[Dẫn truyện Trang ${pageIndex}]`,
          originalText: `[Dẫn truyện Trang ${pageIndex}]`,
          translatedText: `[Dẫn truyện Trang ${pageIndex}]`,
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
