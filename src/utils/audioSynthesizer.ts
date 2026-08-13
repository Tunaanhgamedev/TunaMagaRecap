/**
 * Production-Ready Voice & Speech Audio Synthesizer
 * Speaks pure, natural Vietnamese human narration with ZERO beep/chime artifacts.
 * Supports dynamic volume scaling (0.0 to 1.0) and instant mute control.
 * Properly persists selected voice across panel transitions.
 */

function sanitizeTextForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    // Strip visual/camera markdown notes like *🎨 [Trang 1 • Panel 1]*
    .replace(/\*🎨.*?\*/g, '')
    .replace(/\*🎵.*?\*/g, '')
    .replace(/\*💡.*?\*/g, '')
    // Strip speaker role tags like **[Dẫn Chuyện]**:, **[Nhân Vật]**:
    .replace(/\*\*\[.*?\]\*\*:?/g, '')
    .replace(/\[\/?(Dẫn Chuyện|Nhân vật|Phản Diện|Gợi Ý|BGM|SFX|Audio|Speaker).*?\]:?/gi, '')
    // Strip markdown headers, blockquotes, bullets, and symbols
    .replace(/^#+\s*/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/[*_~`#|]/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // strip emojis
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .trim();
}

class VoiceAudioEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activeUtterances: SpeechSynthesisUtterance[] = []; // GC protection array
  private isSpeakingActive: boolean = false;
  private currentVolume: number = 0.8;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private lastVoiceId: string = '';
  private pendingTimeout: any = null;

  constructor() {
    // Pre-cache voices — browsers load them asynchronously
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Find the best matching voice for a given voiceId.
   * Maps our custom IDs (e.g. 'v-vbee-manhdung') to real browser voices,
   * and caches the result so it persists across panel transitions.
   */
  private resolveVoice(voiceId: string): SpeechSynthesisVoice | null {
    if (voiceId === this.lastVoiceId && this.selectedVoice) {
      return this.selectedVoice;
    }

    if (this.cachedVoices.length === 0) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }

    if (this.cachedVoices.length === 0) return null;

    const voiceKeywords: Record<string, string[]> = {
      'v-vbee-manhdung': ['dũng', 'dung', 'manh', 'male'],
      'v-vbee-thaotrinh': ['thảo', 'thao', 'trinh', 'female'],
      'v-vbee-quynhanh': ['quỳnh', 'quynh', 'anh', 'female'],
      'v-vbee-bahung': ['hùng', 'hung', 'ba', 'male'],
      'v-azure-hoaimy': ['hoài', 'hoai', 'my', 'female'],
      'v-elevenlabs-adam': ['adam'],
    };

    const keywords = voiceKeywords[voiceId] || [];

    const viVoices = this.cachedVoices.filter(
      (v) => v.lang.includes('vi') || v.name.toLowerCase().includes('vietnam')
    );

    if (viVoices.length > 0 && keywords.length > 0) {
      for (const kw of keywords) {
        const match = viVoices.find((v) => v.name.toLowerCase().includes(kw));
        if (match) {
          this.selectedVoice = match;
          this.lastVoiceId = voiceId;
          return match;
        }
      }
    }

    if (viVoices.length > 0) {
      this.selectedVoice = viVoices[0];
      this.lastVoiceId = voiceId;
      return viVoices[0];
    }

    const anyViVoice = this.cachedVoices.find(
      (v) =>
        v.lang.includes('vi') ||
        v.name.toLowerCase().includes('vietnam') ||
        v.name.toLowerCase().includes('vietnamese')
    );

    if (anyViVoice) {
      this.selectedVoice = anyViVoice;
      this.lastVoiceId = voiceId;
      return anyViVoice;
    }

    this.selectedVoice = this.cachedVoices[0] || null;
    this.lastVoiceId = voiceId;
    return this.selectedVoice;
  }

  /**
   * Speaks Vietnamese narration cleanly and naturally with volume control.
   * Sanitizes text to remove markdown/emojis, and preserves voice settings.
   */
  public speak(
    text: string,
    voiceId: string = 'v-vbee-manhdung',
    rate: number = 1.05,
    pitch: number = 1.0,
    volume: number = 0.8,
    onEnd?: () => void
  ) {
    const cleanText = sanitizeTextForSpeech(text);
    if (!cleanText || typeof window === 'undefined') {
      if (onEnd) onEnd();
      return;
    }

    this.currentVolume = Math.max(0, Math.min(1, volume));

    if (this.currentVolume <= 0.01) {
      this.stop();
      if (onEnd) onEnd();
      return;
    }

    if ('speechSynthesis' in window) {
      try {
        if (this.pendingTimeout) {
          clearTimeout(this.pendingTimeout);
          this.pendingTimeout = null;
        }

        // Resume if browser TTS engine is paused
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        // Cancel pending speech safely
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = Math.max(0.85, Math.min(1.4, rate));
        utterance.pitch = Math.max(0.8, Math.min(1.3, pitch));
        utterance.volume = this.currentVolume;
        utterance.lang = 'vi-VN';

        const resolvedVoice = this.resolveVoice(voiceId);
        if (resolvedVoice) {
          utterance.voice = resolvedVoice;
        }

        // GC Protection: keep reference in activeUtterances
        this.activeUtterances.push(utterance);
        if (this.activeUtterances.length > 10) {
          this.activeUtterances.shift();
        }

        utterance.onend = () => {
          this.isSpeakingActive = false;
          const idx = this.activeUtterances.indexOf(utterance);
          if (idx !== -1) this.activeUtterances.splice(idx, 1);
          if (onEnd) onEnd();
        };

        utterance.onerror = () => {
          this.isSpeakingActive = false;
          const idx = this.activeUtterances.indexOf(utterance);
          if (idx !== -1) this.activeUtterances.splice(idx, 1);
          if (onEnd) onEnd();
        };

        this.currentUtterance = utterance;
        this.isSpeakingActive = true;

        this.pendingTimeout = setTimeout(() => {
          if ('speechSynthesis' in window) {
            if (window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
            window.speechSynthesis.speak(utterance);
          }
        }, 30);
      } catch (err) {
        console.warn('[VoiceAudioEngine] Speech engine exception:', err);
      }
    }
  }

  public stop() {
    if (this.pendingTimeout) {
      clearTimeout(this.pendingTimeout);
      this.pendingTimeout = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        this.isSpeakingActive = false;
        this.currentUtterance = null;
        this.activeUtterances = [];
      } catch (err) {}
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeakingActive;
  }
}

export const voiceAudioEngine = new VoiceAudioEngine();


