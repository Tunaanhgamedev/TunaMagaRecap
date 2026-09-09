import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { normalizeRecapText, splitTextIntoChunks } from './textNormalizer.js';

const BASE_SERVER_DIR = process.cwd().endsWith('server') ? process.cwd() : path.join(process.cwd(), 'server');
const CACHE_DIR = path.join(BASE_SERVER_DIR, 'cache', 'audio');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Streaming synthesis for a single text chunk with automatic retry
 */
async function synthesizeChunkWithRetry(chunkText, voice, rate, pitch, retries = 2) {
  let lastErr = null;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

      const readable = tts.toStream(chunkText, {
        rate: rate || '+15%',
        pitch: pitch || '+0Hz',
      });

      const buffers = [];
      const buffer = await new Promise((resolve, reject) => {
        readable.audioStream.on('data', (chunk) => buffers.push(chunk));
        readable.audioStream.on('end', () => resolve(Buffer.concat(buffers)));
        readable.audioStream.on('error', (err) => reject(err));
      });

      if (buffer && buffer.length > 0) {
        return buffer;
      }
    } catch (err) {
      lastErr = err;
      if (attempt <= retries) {
        console.warn(`[EdgeTTS] Chunk attempt ${attempt} failed (${err.message}), retrying...`);
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }
  throw lastErr || new Error('Không thể kết nối đến máy chủ Edge Neural TTS.');
}

export const VOICE_PROFILES = {
  // 1. CapCut Viral Female (Thanh Nữ / Hoạt Ngôn)
  'capcut_vi_thanhnu': {
    id: 'capcut_vi_thanhnu',
    name: 'CapCut - Thanh Nữ (Hoạt Ngôn, Review Manga Triệu View)',
    gender: 'female',
    provider: 'CapCut AI',
    baseVoice: 'vi-VN-HoaiMyNeural',
    defaultRate: '+18%',
    defaultPitch: '+3.5Hz',
    engine: 'edge',
  },
  'v-capcut-thanhnu': {
    id: 'v-capcut-thanhnu',
    name: 'CapCut - Thanh Nữ (Hoạt Ngôn, Review Manga Triệu View)',
    gender: 'female',
    provider: 'CapCut AI',
    baseVoice: 'vi-VN-HoaiMyNeural',
    defaultRate: '+18%',
    defaultPitch: '+3.5Hz',
    engine: 'edge',
  },

  // 2. Vbee Thảo Trinh (Ngôn Tình, Kể Chuyện Đêm Khuya / Sâu Lắng)
  'vbee_vi_thaotrinh': {
    id: 'vbee_vi_thaotrinh',
    name: 'Vbee - Thảo Trinh (Hà Nội - Truyền Cảm, Ngôn Tình / Drama)',
    gender: 'female',
    provider: 'Vbee Studio',
    baseVoice: 'vi-VN-HoaiMyNeural',
    defaultRate: '+4%',
    defaultPitch: '-1.5Hz',
    engine: 'edge',
  },
  'vbee_vi_thaotrinh_emotional': {
    id: 'vbee_vi_thaotrinh_emotional',
    name: 'Vbee - Thảo Trinh (Hà Nội - Truyền Cảm, Ngôn Tình / Drama)',
    gender: 'female',
    provider: 'Vbee Studio',
    baseVoice: 'vi-VN-HoaiMyNeural',
    defaultRate: '+4%',
    defaultPitch: '-1.5Hz',
    engine: 'edge',
  },
  'v-vbee-thaotrinh': {
    id: 'v-vbee-thaotrinh',
    name: 'Vbee - Thảo Trinh (Hà Nội - Truyền Cảm, Ngôn Tình / Drama)',
    gender: 'female',
    provider: 'Vbee Studio',
    baseVoice: 'vi-VN-HoaiMyNeural',
    defaultRate: '+4%',
    defaultPitch: '-1.5Hz',
    engine: 'edge',
  },

  // 3. Vbee Quỳnh Anh (Miền Nam - Ngọt Ngào, Nữ Sinh Dịu Dàng)
  'vbee_vi_quynhanh': {
    id: 'vbee_vi_quynhanh',
    name: 'Vbee - Quỳnh Anh (TP.HCM - Ngọt Ngào, Nữ Sinh Dịu Dàng)',
    gender: 'female',
    provider: 'Vbee Studio',
    baseVoice: 'vi-VN-HoaiMyNeural',
    defaultRate: '+10%',
    defaultPitch: '+2.0Hz',
    engine: 'edge',
  },
  'vbee_vi_quynhanh_south': {
    id: 'vbee_vi_quynhanh_south',
    name: 'Vbee - Quỳnh Anh (TP.HCM - Ngọt Ngào, Nữ Sinh Dịu Dàng)',
    gender: 'female',
    provider: 'Vbee Studio',
    baseVoice: 'vi-VN-HoaiMyNeural',
    defaultRate: '+10%',
    defaultPitch: '+2.0Hz',
    engine: 'edge',
  },
  'v-vbee-quynhanh': {
    id: 'v-vbee-quynhanh',
    name: 'Vbee - Quỳnh Anh (TP.HCM - Ngọt Ngào, Nữ Sinh Dịu Dàng)',
    gender: 'female',
    provider: 'Vbee Studio',
    baseVoice: 'vi-VN-HoaiMyNeural',
    defaultRate: '+10%',
    defaultPitch: '+2.0Hz',
    engine: 'edge',
  },

  // 4. CapCut Dịu Dàng (Kể Chuyện Đêm Khuya / Ma Mị / Tu Tiên)
  'capcut_vi_diudang': {
    id: 'capcut_vi_diudang',
    name: 'CapCut - Nữ Dịu Dàng (Kể Chuyện Đêm Khuya / Ma Mị)',
    gender: 'female',
    provider: 'CapCut AI',
    baseVoice: 'vi-VN-HoaiMyNeural',
    defaultRate: '-2%',
    defaultPitch: '-3.0Hz',
    engine: 'edge',
  },
  'v-capcut-diudang': {
    id: 'v-capcut-diudang',
    name: 'CapCut - Nữ Dịu Dàng (Kể Chuyện Đêm Khuya / Ma Mị)',
    gender: 'female',
    provider: 'CapCut AI',
    baseVoice: 'vi-VN-HoaiMyNeural',
    defaultRate: '-2%',
    defaultPitch: '-3.0Hz',
    engine: 'edge',
  },

  // 5. Chị Google (Huyền thoại Meme / TikTok)
  'google_vi_chigoogle': {
    id: 'google_vi_chigoogle',
    name: 'Chị Google (Huyền Thoại Meme / Tấu Hài TikTok)',
    gender: 'female',
    provider: 'Google Translate',
    engine: 'google',
  },
  'v-google-chigoogle': {
    id: 'v-google-chigoogle',
    name: 'Chị Google (Huyền Thoại Meme / Tấu Hài TikTok)',
    gender: 'female',
    provider: 'Google Translate',
    engine: 'google',
  },

  // 6. Hoài My (Edge Neural Original)
  'vi-VN-HoaiMyNeural': {
    id: 'vi-VN-HoaiMyNeural',
    name: 'Hoài My (Microsoft Edge Neural Nguyên Bản)',
    gender: 'female',
    provider: 'Microsoft Edge Neural',
    baseVoice: 'vi-VN-HoaiMyNeural',
    defaultRate: '+10%',
    defaultPitch: '+0Hz',
    engine: 'edge',
  },

  // 7. Vbee Mạnh Dũng (Nam MC Hà Nội Hào Hùng)
  'vbee_vi_manhdung': {
    id: 'vbee_vi_manhdung',
    name: 'Vbee - Mạnh Dũng (Hà Nội - Nam MC Trầm Ấm, Hào Hùng)',
    gender: 'male',
    provider: 'Vbee Studio',
    baseVoice: 'vi-VN-NamMinhNeural',
    defaultRate: '+12%',
    defaultPitch: '-0.5Hz',
    engine: 'edge',
  },
  'vbee_vi_manhdung_pro': {
    id: 'vbee_vi_manhdung_pro',
    name: 'Vbee - Mạnh Dũng (Hà Nội - Nam MC Trầm Ấm, Hào Hùng)',
    gender: 'male',
    provider: 'Vbee Studio',
    baseVoice: 'vi-VN-NamMinhNeural',
    defaultRate: '+12%',
    defaultPitch: '-0.5Hz',
    engine: 'edge',
  },
  'v-vbee-manhdung': {
    id: 'v-vbee-manhdung',
    name: 'Vbee - Mạnh Dũng (Hà Nội - Nam MC Trầm Ấm, Hào Hùng)',
    gender: 'male',
    provider: 'Vbee Studio',
    baseVoice: 'vi-VN-NamMinhNeural',
    defaultRate: '+12%',
    defaultPitch: '-0.5Hz',
    engine: 'edge',
  },

  // 8. Nam Minh (Edge Neural Original)
  'vi-VN-NamMinhNeural': {
    id: 'vi-VN-NamMinhNeural',
    name: 'Nam Minh (Microsoft Edge Neural - Hào Hùng Cấp SSS)',
    gender: 'male',
    provider: 'Microsoft Edge Neural',
    baseVoice: 'vi-VN-NamMinhNeural',
    defaultRate: '+15%',
    defaultPitch: '+0Hz',
    engine: 'edge',
  },

  // 9. Vbee Bá Hùng (Nam Miền Nam Kịch Tính)
  'vbee_vi_bahung': {
    id: 'vbee_vi_bahung',
    name: 'Vbee - Bá Hùng (TP.HCM - Nam Hào Sảng, Kịch Tính)',
    gender: 'male',
    provider: 'Vbee Studio',
    baseVoice: 'vi-VN-NamMinhNeural',
    defaultRate: '+14%',
    defaultPitch: '+0Hz',
    engine: 'edge',
  },
  'vbee_vi_bahung_action': {
    id: 'vbee_vi_bahung_action',
    name: 'Vbee - Bá Hùng (TP.HCM - Nam Hào Sảng, Kịch Tính)',
    gender: 'male',
    provider: 'Vbee Studio',
    baseVoice: 'vi-VN-NamMinhNeural',
    defaultRate: '+14%',
    defaultPitch: '+0Hz',
    engine: 'edge',
  },
  'v-vbee-bahung': {
    id: 'v-vbee-bahung',
    name: 'Vbee - Bá Hùng (TP.HCM - Nam Hào Sảng, Kịch Tính)',
    gender: 'male',
    provider: 'Vbee Studio',
    baseVoice: 'vi-VN-NamMinhNeural',
    defaultRate: '+14%',
    defaultPitch: '+0Hz',
    engine: 'edge',
  },
};

export class EdgeTtsService {
  /**
   * Synthesize text via Google Translate TTS for ultra-fast, zero-rate-limit narration
   */
  static async synthesizeGoogleTTS(text) {
    const chunks = splitTextIntoChunks(text, 180);
    const audioBuffers = [];

    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=vi&client=tw-ob`;
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://translate.google.com/',
        },
      });
      if (!resp.ok) {
        throw new Error(`Google TTS error: ${resp.status}`);
      }
      const arrayBuf = await resp.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuf));
    }

    return Buffer.concat(audioBuffers);
  }

  /**
   * Synthesize text to MP3 with disk caching and phonetic text normalization
   */
  static async synthesize({
    text,
    voice = 'vi-VN-NamMinhNeural',
    rate,
    pitch,
    genre = '',
    customDictionary = [],
  }) {
    // 1. Resolve Voice Profile
    const profile = VOICE_PROFILES[voice];
    const isGoogleEngine = profile?.engine === 'google' || voice.includes('google');

    let selectedVoice = 'vi-VN-NamMinhNeural';
    if (profile?.baseVoice) {
      selectedVoice = profile.baseVoice;
    } else if (voice.endsWith('Neural')) {
      selectedVoice = voice;
    } else if (voice.includes('hoaimy') || voice.includes('thanhnu') || voice.includes('thaotrinh') || voice.includes('quynhanh') || voice.includes('diudang')) {
      selectedVoice = 'vi-VN-HoaiMyNeural';
    } else if (voice.includes('namminh') || voice.includes('manhdung') || voice.includes('bahung')) {
      selectedVoice = 'vi-VN-NamMinhNeural';
    } else if (voice.startsWith('en-') || voice.startsWith('ja-') || voice.startsWith('ko-') || voice.startsWith('zh-') || voice.startsWith('es-') || voice.startsWith('fr-') || voice.startsWith('de-')) {
      selectedVoice = voice;
    }

    // Determine rate & pitch with profile defaults
    let resolvedRate = rate || profile?.defaultRate || '+15%';
    let resolvedPitch = pitch || profile?.defaultPitch || '+0Hz';

    // 2. Normalize text (language-aware)
    const cleanedText = normalizeRecapText(text, { genre, customDictionary, voice: selectedVoice });
    if (!cleanedText) {
      throw new Error('Văn bản trống sau khi chuẩn hóa.');
    }

    // Ensure format of rate and pitch
    let formattedRate = resolvedRate;
    if (typeof formattedRate === 'number') {
      const pct = Math.round((formattedRate - 1.0) * 100);
      formattedRate = pct >= 0 ? `+${pct}%` : `${pct}%`;
    }
    if (typeof formattedRate !== 'string' || !formattedRate.includes('%')) {
      formattedRate = '+15%';
    }

    let formattedPitch = resolvedPitch;
    if (typeof formattedPitch === 'number') {
      const hz = Math.round((formattedPitch - 1.0) * 50);
      formattedPitch = hz >= 0 ? `+${hz}Hz` : `${hz}Hz`;
    }
    if (typeof formattedPitch !== 'string' || !formattedPitch.includes('Hz')) {
      formattedPitch = '+0Hz';
    }

    // 3. Generate MD5 Cache Key
    const hash = crypto
      .createHash('md5')
      .update(`${isGoogleEngine ? 'google_vi' : selectedVoice}_${formattedRate}_${formattedPitch}_${cleanedText}`)
      .digest('hex');

    const fileName = `${hash}.mp3`;
    const filePath = path.join(CACHE_DIR, fileName);
    const audioUrl = `/api/tts/audio/${fileName}`;

    // 4. Return cached file if present
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 100) {
        const audioBuffer = fs.readFileSync(filePath);
        return {
          fileName,
          filePath,
          audioUrl,
          base64: `data:audio/mp3;base64,${audioBuffer.toString('base64')}`,
          cached: true,
          cleanedText,
          duration: Math.max(1, Math.round(audioBuffer.length / 12000)),
          voice: isGoogleEngine ? 'google_vi_chigoogle' : selectedVoice,
        };
      }
    }

    // 5. Synthesize via Google TTS or Edge TTS
    let finalBuffer;
    if (isGoogleEngine) {
      finalBuffer = await EdgeTtsService.synthesizeGoogleTTS(cleanedText);
    } else {
      const chunks = splitTextIntoChunks(cleanedText, 700);
      const audioBuffers = [];

      for (const chunk of chunks) {
        const chunkBuffer = await synthesizeChunkWithRetry(chunk, selectedVoice, formattedRate, formattedPitch, 2);
        if (chunkBuffer && chunkBuffer.length > 0) {
          audioBuffers.push(chunkBuffer);
        }
      }

      if (audioBuffers.length === 0) {
        throw new Error('Không nhận được luồng âm thanh từ Edge TTS.');
      }
      finalBuffer = Buffer.concat(audioBuffers);
    }

    await fs.promises.writeFile(filePath, finalBuffer);

    return {
      fileName,
      filePath,
      audioUrl,
      base64: `data:audio/mp3;base64,${finalBuffer.toString('base64')}`,
      cached: false,
      cleanedText,
      duration: Math.max(1, Math.round(finalBuffer.length / 12000)),
      voice: selectedVoice,
    };
  }

  /**
   * Get Cached Audio file buffer
   */
  static getAudioFile(fileName) {
    const safeName = path.basename(fileName);
    const filePath = path.join(CACHE_DIR, safeName);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    }
    return null;
  }
}
