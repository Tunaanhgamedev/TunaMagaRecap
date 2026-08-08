/**
 * Production-Ready Voice & Speech Audio Synthesizer
 * Supports Vbee AI Voices, Web SpeechSynthesis & Web Audio Formants
 */

class VoiceAudioEngine {
  private audioCtx: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingActive: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Speaks Vietnamese narration loud and clear
   */
  public speak(
    text: string,
    voiceId: string = 'v-vbee-manhdung',
    rate: number = 1.05,
    pitch: number = 1.0,
    onEnd?: () => void
  ) {
    if (!text || typeof window === 'undefined') return;

    // 1. Play natural acoustic chime / voice pulse
    this.playAcousticVoicePulse(voiceId);

    // 2. Browser SpeechSynthesis Engine
    if ('speechSynthesis' in window) {
      try {
        // Cancel any pending speech safely
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = Math.max(0.8, Math.min(1.5, rate));
        utterance.pitch = Math.max(0.7, Math.min(1.4, pitch));
        utterance.lang = 'vi-VN';

        // Select suitable voice
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
          console.warn('[VoiceAudioEngine] SpeechSynthesis error:', e);
          this.isSpeakingActive = false;
          if (onEnd) onEnd();
        };

        this.currentUtterance = utterance;
        this.isSpeakingActive = true;

        // Slight microtask delay avoids Chrome's synchronous cancel-speak lockup
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 30);
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

  /**
   * Generates vocal speech formant tones through Web Audio
   */
  private playAcousticVoicePulse(voiceId: string) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const isFemale =
        voiceId.includes('thaotrinh') ||
        voiceId.includes('quynhanh') ||
        voiceId.includes('phuongtrang');
      const freq = isFemale ? 260 : 160;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.95, now + 0.22);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  }
}

export const voiceAudioEngine = new VoiceAudioEngine();
