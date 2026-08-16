export const transformTextCase = (str: string, caseType: 'upper' | 'lower' | 'title' | 'sentence' | 'none'): string => {
  if (!str) return '';
  if (caseType === 'upper') return str.toUpperCase();
  if (caseType === 'lower') return str.toLowerCase();
  if (caseType === 'title') {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  }
  if (caseType === 'sentence') {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return str;
};

export const cleanNoiseFromText = (text: string): string => {
  let processedText = (text || '')
    .replace(/[|—_\\\/\[\]\{\}\(\)\<\>~`^+=*#$@%&©;:]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const tokens = processedText.split(' ').filter((t) => {
    const trimmed = t.trim();
    if (!trimmed) return false;
    if (trimmed.length === 1 && !/^[aAàÀáÁeEèÈéÉiIoOuUyY]$/i.test(trimmed)) return false;
    if (/\d+[a-zA-Z]+|[a-zA-Z]+\d+/.test(trimmed) && !/^[ESDABC]급?$/i.test(trimmed)) return false;
    if (trimmed.length === 2 && /^(xx|ip|vy|cu|na|gg|nl|aa|nl)$/i.test(trimmed)) return false;
    return true;
  });

  let cleaned = tokens.join(' ')
    .replace(/\b([a-zA-ZÀ-ỹ])\s+([a-zA-ZÀ-ỹ])\s+([a-zA-ZÀ-ỹ])\b/g, '$1$2$3')
    .replace(/\b([a-zA-ZÀ-ỹ])\s+([a-zA-ZÀ-ỹ])\b/g, '$1$2')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!cleaned || cleaned.length < 2) {
    return text || '';
  }

  return cleaned;
};
