import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const BASE_SERVER_DIR = process.cwd().endsWith('server') ? process.cwd() : path.join(process.cwd(), 'server');
const CACHE_DIR = path.join(BASE_SERVER_DIR, 'cache', 'audio', 'vbee');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export const VBEE_VOICE_MAP = {
  // Thảo Trinh - Hà Nội Nữ (Kể Chuyện, Ngôn Tình, Truyền Cảm)
  'vbee_vi_thaotrinh': 'hn_female_thaotrinh_dialog_48k-fh',
  'v-vbee-thaotrinh': 'hn_female_thaotrinh_dialog_48k-fh',

  // Mạnh Dũng - Hà Nội Nam (MC Hào Hùng, Kiếm Hiệp, Tu Tiên, Review Triệu View)
  'vbee_vi_manhdung': 'hn_male_manhdung_news_48k-fh',
  'v-vbee-manhdung': 'hn_male_manhdung_news_48k-fh',

  // Ngọc Huyền - Hà Nội Nữ (Đọc Truyện Đêm Khuya, Ma Mị, Trinh Thám)
  'vbee_vi_ngochuyen': 'hn_female_ngochuyen_full_48k-fh',
  'v-vbee-ngochuyen': 'hn_female_ngochuyen_full_48k-fh',

  // Quỳnh Anh - Sài Gòn Nữ (Ngọt Ngào, Nhẹ Nhàng, Nữ Sinh)
  'vbee_vi_quynhanh': 'sg_female_quynhanh_dialog_48k-fh',
  'v-vbee-quynhanh': 'sg_female_quynhanh_dialog_48k-fh',

  // Bá Hùng - Sài Gòn Nam (Kịch Tính, Combat, Hành Động)
  'vbee_vi_bahung': 'sg_male_bahung_dialog_48k-fh',
  'v-vbee-bahung': 'sg_male_bahung_dialog_48k-fh',

  // Phong Vũ - Sài Gòn Nam (Trầm Ấm, Triết Lý, Sâu Sắc)
  'vbee_vi_phongvu': 'hn_male_phongvu_news_48k-fh',
  'v-vbee-phongvu': 'hn_male_phongvu_news_48k-fh',

  // Hương Giang - Huế Nữ (Dịu Dàng, Hoài Niệm)
  'vbee_vi_huonggiang': 'hue_female_huonggiang_news_48k-fh',
  'v-vbee-huonggiang': 'hue_female_huonggiang_news_48k-fh',

  // Mai Phương - Hà Nội Nữ (Tin Tức, Rõ Ràng)
  'vbee_vi_maiphuong': 'hn_female_maiphuong_news_48k-fh',
  'v-vbee-maiphuong': 'hn_female_maiphuong_news_48k-fh',
};

export class VbeeTtsService {
  /**
   * Check if Vbee credentials are configured
   */
  static isConfigured(appId, token) {
    const finalAppId = appId || process.env.VBEE_APP_ID;
    const finalToken = token || process.env.VBEE_ACCESS_TOKEN || process.env.VBEE_TOKEN;
    return Boolean(finalAppId && finalToken);
  }

  /**
   * Synthesize audio via Vbee Official API (vbee.vn)
   */
  static async synthesize({
    text,
    voice = 'vbee_vi_thaotrinh',
    rate = 1.0,
    appId = '',
    token = '',
  }) {
    const finalAppId = appId || process.env.VBEE_APP_ID;
    const finalToken = token || process.env.VBEE_ACCESS_TOKEN || process.env.VBEE_TOKEN;

    if (!finalAppId || !finalToken) {
      throw new Error('Chưa cấu hình VBEE_APP_ID hoặc VBEE_ACCESS_TOKEN');
    }

    const vbeeVoiceCode = VBEE_VOICE_MAP[voice] || 'hn_female_thaotrinh_dialog_48k-fh';
    const cacheKey = crypto
      .createHash('md5')
      .update(`vbee_${vbeeVoiceCode}_${rate}_${text}`)
      .digest('hex');
    const cachedFilePath = path.join(CACHE_DIR, `${cacheKey}.mp3`);

    // Check disk cache
    if (fs.existsSync(cachedFilePath)) {
      const buffer = fs.readFileSync(cachedFilePath);
      return {
        buffer,
        fileName: `${cacheKey}.mp3`,
        filePath: cachedFilePath,
        audioUrl: `/api/tts/audio/vbee/${cacheKey}.mp3`,
        provider: 'Vbee Official Studio',
        cached: true,
      };
    }

    // Step 1: Send synthesis request to Vbee API
    const response = await fetch('https://vbee.vn/api/v1/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${finalToken}`,
      },
      body: JSON.stringify({
        app_id: finalAppId,
        input_text: text,
        voice_code: vbeeVoiceCode,
        audio_type: 'mp3',
        bit_rate: 128,
        speed_rate: typeof rate === 'number' ? rate : 1.0,
      }),
    });

    const resData = await response.json();
    if (!response.ok || resData.status !== 1) {
      throw new Error(resData.message || resData.error || `Vbee API Error: ${response.status}`);
    }

    const requestId = resData.result?.request_id || resData.request_id;
    if (!requestId) {
      throw new Error('Vbee API không trả về request_id');
    }

    // Step 2: Poll status until SUCCESS
    let audioUrl = '';
    const maxAttempts = 30; // 30 x 1s = 30s max
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const statusRes = await fetch(`https://vbee.vn/api/v1/tts/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${finalToken}`,
        },
      });

      if (!statusRes.ok) continue;
      const statusData = await statusRes.json();
      const status = statusData.result?.status || statusData.status;

      if (status === 'SUCCESS' || status === 'DONE' || status === 1) {
        audioUrl = statusData.result?.audio_link || statusData.audio_link;
        break;
      } else if (status === 'FAILED' || status === 'ERROR') {
        throw new Error(statusData.message || 'Vbee xử lý audio thất bại');
      }
    }

    if (!audioUrl) {
      throw new Error('Vbee API quá thời gian xử lý (Timeout 30s)');
    }

    // Step 3: Download audio buffer and save to cache
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) {
      throw new Error(`Không thể tải audio từ Vbee CDN: ${audioRes.status}`);
    }

    const arrayBuffer = await audioRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(cachedFilePath, buffer);

    return {
      buffer,
      fileName: `${cacheKey}.mp3`,
      filePath: cachedFilePath,
      audioUrl: `/api/tts/audio/vbee/${cacheKey}.mp3`,
      provider: 'Vbee Official Studio',
      cached: false,
    };
  }
}
