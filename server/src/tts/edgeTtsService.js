import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { normalizeRecapText, splitTextIntoChunks } from './textNormalizer.js';

const CACHE_DIR = path.resolve(process.cwd(), 'server', 'cache', 'audio');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function synthesizeChunk(tts, text, rate, pitch) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    try {
      const readable = tts.toStream(text, { rate, pitch });

      readable.audioStream.on('data', (data) => buffers.push(data));
      readable.audioStream.on('end', () => resolve(Buffer.concat(buffers)));
      readable.audioStream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}

export class EdgeTtsService {
  /**
   * Synthesizes natural Vietnamese narration via Microsoft Edge Neural TTS with disk caching
   */
  static async synthesize({
    text,
    voice = 'vi-VN-NamMinhNeural',
    rate = '+15%',
    pitch = '+0Hz',
  }) {
    // 1. Normalize text (replace foreign names, gaming terms, strip markdown/director notes)
    const cleanedText = normalizeRecapText(text);
    if (!cleanedText) {
      throw new Error('Văn bản trống sau khi chuẩn hóa.');
    }

    // 2. Map voice IDs to valid Edge Neural Voice IDs
    let selectedVoice = voice;
    if (voice.includes('hoaimy') || voice.includes('nu') || voice.includes('female') || voice.includes('thaotrinh') || voice.includes('quynhanh')) {
      selectedVoice = 'vi-VN-HoaiMyNeural';
    } else if (voice.includes('namminh') || voice.includes('manhdung') || voice.includes('bahung') || voice.includes('huukien') || voice.includes('male')) {
      selectedVoice = 'vi-VN-NamMinhNeural';
    } else if (!voice.includes('Neural')) {
      selectedVoice = 'vi-VN-NamMinhNeural';
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

    const tts = new MsEdgeTTS();
    await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

    for (const chunk of chunks) {
      const chunkBuffer = await synthesizeChunk(tts, chunk, formattedRate, formattedPitch);
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
