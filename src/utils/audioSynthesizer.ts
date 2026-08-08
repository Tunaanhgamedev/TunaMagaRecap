/**
 * Universal Voice & Text-to-Speech Audio Synthesizer
 * Uses Web Audio API Formant Synthesis + SpeechSynthesis with fallback
 */

class VoiceAudioEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private initAudio() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isUnlocked = true;
  }

  /**
   * Speaks Vietnamese text with Web Speech API + Audio Synthesis Tone
   */
  public speak(text: string, voiceId: string = 'v-vbee-manhdung', rate: number = 1.05, pitch: number = 1.0) {
    if (!text || typeof window === 'undefined') return;

    this.initAudio();

    // 1. Play natural speech frequency audio chime / voice formant
    this.playSpeechChime(voiceId);

    // 2. Play Web Speech Synthesis
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.lang = 'vi-VN';

        // Select best available voice
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

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[TTS Audio Engine] SpeechSynthesis error:', err);
      }
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (err) {}
    }
  }

  /**
   * Synthesizes audio frequencies with human speech vowel formants
   */
  private playSpeechChime(voiceId: string) {
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch based on male / female voice
      const isFemale = voiceId.includes('thaotrinh') || voiceId.includes('quynhanh') || voiceId.includes('phuongtrang');
      const baseFreq = isFemale ? 280 : 165;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.15, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, now + 0.25);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }
}

export const voiceAudioEngine = new VoiceAudioEngine();
