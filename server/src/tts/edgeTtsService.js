import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { normalizeRecapText, splitTextIntoChunks } from './textNormalizer.js';

const CACHE_DIR = path.join(process.cwd(), 'server', 'cache', 'audio');

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

export class EdgeTtsService {
  /**
   * Synthesize text to MP3 with disk caching and phonetic text normalization
   */
  static async synthesize({
    text,
    voice = 'vi-VN-NamMinhNeural',
    rate = '+15%',
    pitch = '+0Hz',
    genre = '',
    customDictionary = [],
  }) {
    // 1. Map voice IDs to valid Edge Neural Voice IDs
    let selectedVoice = voice;
    const KNOWN_VOICE_ALIASES = {
      'vbee_vi_manhdung_pro': 'vi-VN-NamMinhNeural',
      'v-vbee-manhdung': 'vi-VN-NamMinhNeural',
      'vbee_vi_thaotrinh_emotional': 'vi-VN-HoaiMyNeural',
      'v-vbee-thaotrinh': 'vi-VN-HoaiMyNeural',
      'vbee_vi_quynhanh_south': 'vi-VN-HoaiMyNeural',
      'v-vbee-quynhanh': 'vi-VN-HoaiMyNeural',
      'vbee_vi_bahung_action': 'vi-VN-NamMinhNeural',
      'v-vbee-bahung': 'vi-VN-NamMinhNeural',
      'v-eleven-adam': 'en-US-GuyNeural',
    };

    if (KNOWN_VOICE_ALIASES[voice]) {
      selectedVoice = KNOWN_VOICE_ALIASES[voice];
    } else if (voice.endsWith('Neural')) {
      selectedVoice = voice;
    } else if (voice.includes('hoaimy') || voice.includes('thaotrinh') || voice.includes('quynhanh')) {
      selectedVoice = 'vi-VN-HoaiMyNeural';
    } else if (voice.includes('namminh') || voice.includes('manhdung') || voice.includes('bahung')) {
      selectedVoice = 'vi-VN-NamMinhNeural';
    } else {
      selectedVoice = 'vi-VN-NamMinhNeural';
    }

    // 2. Normalize text (language-aware)
    const cleanedText = normalizeRecapText(text, { genre, customDictionary, voice: selectedVoice });
    if (!cleanedText) {
      throw new Error('Văn bản trống sau khi chuẩn hóa.');
    }

    // Ensure format of rate and pitch
    let formattedRate = rate;
    if (typeof rate === 'number') {
      const pct = Math.round((rate - 1.0) * 100);
      formattedRate = pct >= 0 ? `+${pct}%` : `${pct}%`;
    }
    if (!formattedRate.includes('%')) {
      formattedRate = '+15%';
    }

    let formattedPitch = pitch;
    if (typeof pitch === 'number') {
      const hz = Math.round((pitch - 1.0) * 50);
      formattedPitch = hz >= 0 ? `+${hz}Hz` : `${hz}Hz`;
    }
    if (!formattedPitch.includes('Hz')) {
      formattedPitch = '+0Hz';
    }

    // 3. Generate MD5 Cache Key
    const hash = crypto
      .createHash('md5')
      .update(`${selectedVoice}_${formattedRate}_${formattedPitch}_${cleanedText}`)
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
          voice: selectedVoice,
        };
      }
    }

    // 5. Chunk text if long and synthesize
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

    const finalBuffer = Buffer.concat(audioBuffers);
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
