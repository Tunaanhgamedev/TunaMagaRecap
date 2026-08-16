/**
 * Vietnamese Text Normalizer for Manga / Manhwa / Manhua Recap TTS
 * Transforms foreign names, gaming terms, and manga formatting into 100% natural Vietnamese pronunciation.
 */

const PRONUNCIATION_DICTIONARY = [
  // Manhwa Hàn Quốc
  [/\bSung\s+Jin[- ]?woo\b/gi, 'Sung Jin U'],
  [/\bCha\s+Hae[- ]?in\b/gi, 'Cha Hae In'],
  [/\bKim\s+Dok[- ]?ja\b/gi, 'Kim Đốc Cha'],
  [/\bHan\s+Soo[- ]?young\b/gi, 'Han Su Dương'],
  [/\bYoo\s+Joong[- ]?hyuk\b/gi, 'Du Trung Hách'],
  [/\bArthur\s+Leywin\b/gi, 'Át-thơ Lay-uyn'],
  [/\bTessia\b/gi, 'Tét-xi-a'],
  [/\bSylvie\b/gi, 'Sin-vi'],

  // Manhua Trung Quốc (Pinyin -> Hán Việt chuẩn)
  [/\bGu\s+Chang[- ]?ge\b/gi, 'Cổ Trường Ca'],
  [/\bXiao\s+Yan\b/gi, 'Tiêu Viêm'],
  [/\bShi\s+Hao\b/gi, 'Thạch Hạo'],
  [/\bTang\s+San\b/gi, 'Đường Tam'],
  [/\bLuo\s+Feng\b/gi, 'La Phong'],
  [/\bLin\s+Dong\b/gi, 'Lâm Động'],
  [/\bZhou\s+Yuan\b/gi, 'Chu Nguyên'],
  [/\bYun\s+Che\b/gi, 'Vân Triệt'],
  [/\bHan\s+Li\b/gi, 'Hàn Lập'],
  [/\bFang\s+Yuan\b/gi, 'Phương Nguyên'],

  // Manga Nhật Bản
  [/\bLuffy\b/gi, 'Lúp-phi'],
  [/\bZoro\b/gi, 'Zô-rô'],
  [/\bSanji\b/gi, 'San-ji'],
  [/\bNaruto\b/gi, 'Na-ru-tô'],
  [/\bSasuke\b/gi, 'Sa-su-kê'],
  [/\bGojo\s+Satoru\b/gi, 'Gô-giô Sa-tô-ru'],
  [/\bSukuna\b/gi, 'Su-ku-na'],
  [/\bRimuru\s+Tempest\b/gi, 'Ri-mu-ru Tem-pét'],
  [/\bTanjiro\b/gi, 'Tan-ji-rô'],
  [/\bNezuko\b/gi, 'Nê-zu-kô'],
  [/\bDeku\b/gi, 'Đê-ku'],
  [/\bBakugo\b/gi, 'Ba-ku-gô'],

  // Thuật ngữ Manga / Gaming / Manhwa Recap
  [/\b(chap|chapter)\s*(\d+)/gi, 'chương $2'],
  [/\b(lv|lvl|level)\s*(\d+)/gi, 'cấp $2'],
  [/\b(SSS)\s*[- ]?(rank|hạng)?\b/gi, 'hạng tam ét'],
  [/\b(SS)\s*[- ]?(rank|hạng)?\b/gi, 'hạng kép ét'],
  [/\bS\s*[- ]?(rank|hạng)\b/gi, 'hạng ét'],
  [/\bA\s*[- ]?(rank|hạng)\b/gi, 'hạng A'],
  [/\bB\s*[- ]?(rank|hạng)\b/gi, 'hạng B'],
  [/\bC\s*[- ]?(rank|hạng)\b/gi, 'hạng C'],
  [/\bF\s*[- ]?(rank|hạng)\b/gi, 'hạng F'],
  [/\bHP\b/g, 'máu'],
  [/\bMP\b/g, 'năng lượng'],
  [/\bEXP\b/g, 'kinh nghiệm'],
  [/\bNPC\b/g, 'nhân vật phụ'],
  [/\bMC\b/g, 'nhân vật chính'],
  [/\bOP\b/g, 'bá đạo'],
  [/\bboss\b/gi, 'trùm'],
  [/\bbuff\b/gi, 'tăng sức mạnh'],
  [/\bnerf\b/gi, 'giảm sức mạnh'],
  [/\bsolo\b/gi, 'đấu đơn'],
  [/\bgate\b/gi, 'cổng hầm ngục'],
  [/\bdungeon\b/gi, 'hầm ngục'],
  [/\bguild\b/gi, 'bang hội'],
  [/\bhunter\b/gi, 'thợ săn'],
  [/\bitem\b/gi, 'vật phẩm'],
  [/\bskill\b/gi, 'kỹ năng'],
  [/\bmana\b/gi, 'ma lực'],
  [/\bstat\b/gi, 'chỉ số'],
  [/\bstatus\b/gi, 'bảng trạng thái'],
  [/\bquest\b/gi, 'nhiệm vụ'],
];

/**
 * Clean and normalize text before Edge Neural TTS synthesis
 */
export function normalizeRecapText(text) {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text;

  // 1. Remove script director notes: *🎨 [Trang 1 • Panel 1]*, *🎵 [BGM: Hào Hùng]*, *💡 [SFX]*
  cleaned = cleaned.replace(/\*🎨.*?\*/g, '');
  cleaned = cleaned.replace(/\*🎵.*?\*/g, '');
  cleaned = cleaned.replace(/\*💡.*?\*/g, '');
  cleaned = cleaned.replace(/\*\*\[.*?\]\*\*:?/g, '');
  cleaned = cleaned.replace(/\[\/?(Dẫn Chuyện|Nhân vật|Phản Diện|Gợi Ý|BGM|SFX|Audio|Speaker|Trang \d+|Panel \d+).*?\]:?/gi, '');

  // 2. Remove script annotations in brackets: [Cười], (hét lớn), 【thở dài】
  cleaned = cleaned.replace(/\[[^\]]*\]/g, ' ');
  cleaned = cleaned.replace(/\([^)]*\)/g, ' ');
  cleaned = cleaned.replace(/【[^】]*】/g, ' ');

  // 3. Remove Markdown formatting
  cleaned = cleaned.replace(/^#+\s+/gm, '');
  cleaned = cleaned.replace(/^>\s+/gm, '');
  cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
  cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1');

  // 4. Remove emojis
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  // 5. Apply pronunciation dictionary
  for (const [pattern, replacement] of PRONUNCIATION_DICTIONARY) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // 6. Handle breathing pauses and punctuation
  // Ellipses "..." often cause long awkward silence; replace with comma for dramatic suspense
  cleaned = cleaned.replace(/\.{3,}/g, ', ');
  cleaned = cleaned.replace(/…/g, ', ');
  cleaned = cleaned.replace(/[;:]/g, ', ');

  // Clean excessive spaces and newlines
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Split long script text into natural sentence chunks (< 800 chars) for smooth streaming
 */
export function splitTextIntoChunks(text, maxChars = 800) {
  if (!text) return [];
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars) {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
