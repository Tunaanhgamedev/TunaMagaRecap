/**
 * Production-Ready Voice & Speech Audio Synthesizer
 * Speaks pure, natural Vietnamese human narration with ZERO beep/chime artifacts.
 * Supports dynamic volume scaling (0.0 to 1.0) and instant mute control.
 * Properly persists selected voice across panel transitions.
 */

class VoiceAudioEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingActive: boolean = false;
  private currentVolume: number = 0.8;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private lastVoiceId: string = '';

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
    // If same voiceId as before and we have a cached match, reuse it
    if (voiceId === this.lastVoiceId && this.selectedVoice) {
      return this.selectedVoice;
    }

    // Refresh voice list if empty
    if (this.cachedVoices.length === 0) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }

    if (this.cachedVoices.length === 0) return null;

    // Priority mapping: our voiceId keywords → voice search terms
    const voiceKeywords: Record<string, string[]> = {
      'v-vbee-manhdung': ['dũng', 'dung', 'manh', 'male'],
      'v-vbee-thaotrinh': ['thảo', 'thao', 'trinh', 'female'],
      'v-vbee-quynhanh': ['quỳnh', 'quynh', 'anh', 'female'],
      'v-vbee-bahung': ['hùng', 'hung', 'ba', 'male'],
      'v-azure-hoaimy': ['hoài', 'hoai', 'my', 'female'],
      'v-elevenlabs-adam': ['adam'],
    };

    const keywords = voiceKeywords[voiceId] || [];

    // Step 1: Try exact keyword match in Vietnamese voices
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

    // Step 2: Use first Vietnamese voice available
    if (viVoices.length > 0) {
      this.selectedVoice = viVoices[0];
      this.lastVoiceId = voiceId;
      return viVoices[0];
    }

    // Step 3: Fallback — any voice with 'vi' or use the default
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

    // Step 4: Use first available voice (ultimate fallback)
    this.selectedVoice = this.cachedVoices[0] || null;
    this.lastVoiceId = voiceId;
    return this.selectedVoice;
  }

  /**
   * Speaks Vietnamese narration cleanly and naturally with volume control.
   * Preserves the selected voice across panel transitions.
   */
  public speak(
    text: string,
    voiceId: string = 'v-vbee-manhdung',
    rate: number = 1.05,
    pitch: number = 1.0,
    volume: number = 0.8,
    onEnd?: () => void
  ) {
    if (!text || typeof window === 'undefined') return;

    this.currentVolume = Math.max(0, Math.min(1, volume));

    // If muted or near zero volume, cancel and return immediately
    if (this.currentVolume <= 0.01) {
      this.stop();
      if (onEnd) onEnd();
      return;
    }

    // Browser SpeechSynthesis Engine
    if ('speechSynthesis' in window) {
      try {
        // Cancel any pending speech safely
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = Math.max(0.85, Math.min(1.4, rate));
        utterance.pitch = Math.max(0.8, Math.min(1.3, pitch));
        utterance.volume = this.currentVolume;
        utterance.lang = 'vi-VN';

        // Use resolved voice — persists across panel transitions
        const resolvedVoice = this.resolveVoice(voiceId);
        if (resolvedVoice) {
          utterance.voice = resolvedVoice;
        }

        utterance.onend = () => {
          this.isSpeakingActive = false;
          if (onEnd) onEnd();
        };

        utterance.onerror = () => {
          this.isSpeakingActive = false;
          if (onEnd) onEnd();
        };

        this.currentUtterance = utterance;
        this.isSpeakingActive = true;

        // Slight microtask delay avoids Chrome's synchronous cancel-speak lockup
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 20);
      } catch (err) {
        console.warn('[VoiceAudioEngine] Speech engine exception:', err);
      }
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        this.isSpeakingActive = false;
        this.currentUtterance = null;
      } catch (err) {}
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeakingActive;
  }
}

export const voiceAudioEngine = new VoiceAudioEngine();

