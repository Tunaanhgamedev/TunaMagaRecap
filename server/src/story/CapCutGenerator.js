export class CapCutGenerator {
  static createDraft({ title, seriesName, chapterNumber, pages, aspect = '16:9' }) {
    const isVertical = aspect === '9:16';
    const canvasWidth = isVertical ? 1080 : 1920;
    const canvasHeight = isVertical ? 1920 : 1080;

    const clips = (pages || []).map((page, idx) => {
      // Determine emotion and camera effect
      let effect = 'dramatic_zoom';
      let keyframes = [];

      if (idx % 4 === 0) {
        // Fight / Action -> Camera Shake & Punch Zoom
        effect = 'camera_shake';
        keyframes = [
          { time: 0.0, scale: 1.0, x: 0, y: 0 },
          { time: 1.5, scale: 1.25, x: 15, y: -10 },
          { time: 3.0, scale: 1.15, x: -10, y: 8 },
        ];
      } else if (idx % 4 === 1) {
        // Power Up / Reveal -> Fast Zoom In
        effect = 'fast_zoom_in';
        keyframes = [
          { time: 0.0, scale: 1.0, x: 0, y: 0 },
          { time: 3.5, scale: 1.35, x: 0, y: 0 },
        ];
      } else if (idx % 4 === 2) {
        // Sad / Tension -> Slow Zoom Out
        effect = 'slow_zoom_out';
        keyframes = [
          { time: 0.0, scale: 1.3, x: 0, y: 0 },
          { time: 4.0, scale: 1.05, x: 0, y: 0 },
        ];
      } else {
        // Scenery / Dialogue -> Slow Pan
        effect = 'slow_pan';
        keyframes = [
          { time: 0.0, scale: 1.15, x: -30, y: 0 },
          { time: 4.0, scale: 1.15, x: 30, y: 0 },
        ];
      }

      return {
        id: `capcut-clip-${idx + 1}`,
        pageIndex: idx + 1,
        imageUrl: page.imageUrl,
        durationSec: 4.0,
        effect,
        keyframes,
      };
    });

    return {
      version: '3.6.0',
      projectName: `${seriesName} - Chapter ${chapterNumber} (${aspect})`,
      canvas: {
        width: canvasWidth,
        height: canvasHeight,
        aspectRatio: aspect,
        fps: 60,
      },
      tracks: [
        { id: 'video-track-1', type: 'video', clips },
        {
          id: 'audio-tts-track',
          type: 'audio',
          clips: [
            { id: 'tts-1', start: 0, duration: clips.length * 4.0, title: 'AI Vietnamese Voiceover' },
          ],
        },
        {
          id: 'subtitle-track',
          type: 'subtitle',
          clips: [
            { id: 'sub-1', start: 0, duration: 4.0, text: `Chào mừng các bạn đến với ${seriesName} Chapter ${chapterNumber}!` },
          ],
        },
      ],
      exportSettings: {
        format: 'MP4',
        codec: 'H.264',
        bitrate: '18000kbps',
        resolution: `${canvasWidth}x${canvasHeight}`,
      },
    };
  }
}
