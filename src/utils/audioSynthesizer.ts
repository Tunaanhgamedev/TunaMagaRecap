/**
 * Production-Ready Voice & Speech Audio Synthesizer
 * Speaks pure, natural Vietnamese human narration with ZERO beep/chime artifacts.
 */

class VoiceAudioEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingActive: boolean = false;

  /**
   * Speaks Vietnamese narration cleanly and naturally without any beep/chime sound
   */
  public speak(
    text: string,
    voiceId: string = 'v-vbee-manhdung',
    rate: number = 1.05,
    pitch: number = 1.0,
    onEnd?: () => void
  ) {
    if (!text || typeof window === 'undefined') return;

    // Browser SpeechSynthesis Engine
    if ('speechSynthesis' in window) {
      try {
        // Cancel any pending speech safely
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = Math.max(0.85, Math.min(1.4, rate));
        utterance.pitch = Math.max(0.8, Math.min(1.3, pitch));
        utterance.lang = 'vi-VN';

        // Select suitable Vietnamese voice
        const voices = window.speechSynthesis.getVoices();
        const viVoice = voices.find(
          (v) =>
            v.lang.includes('vi') ||
            v.name.toLowerCase().includes('vietnam') ||
            v.name.toLowerCase().includes('vietnamese') ||
            v.name.toLowerCase().includes('an') ||
            v.name.toLowerCase().includes('nam') ||
            v.name.toLowerCase().includes('mai')
        );

        if (viVoice) {
          utterance.voice = viVoice;
        }

        utterance.onend = () => {
          this.isSpeakingActive = false;
          if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
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
      } catch (err) {}
    }
  }
}

export const voiceAudioEngine = new VoiceAudioEngine();
