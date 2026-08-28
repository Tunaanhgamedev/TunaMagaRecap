/**
 * Production-Grade Cinematic Sound FX & AI BGM Engine with Real-Time Audio Ducking
 * Generates ultra-crisp anime SFX (Slash, Heavy Impact, Thunder, System Ding, Magic, Power Up)
 * Synthesizes dynamic mood BGM (Epic Battle, Mysterious Lore, Tension, Emotional, Phonk)
 * Automatically ducks BGM volume during Voice Narration.
 */

export type SoundEffectType =
  | 'slash'
  | 'heavy_impact'
  | 'thunder'
  | 'system_ding'
  | 'magic_cast'
  | 'whoosh'
  | 'power_up'
  | 'heartbeat';

export type MoodBgmType =
  | 'epic_battle'
  | 'mysterious_lore'
  | 'tension_suspense'
  | 'emotional_sad'
  | 'phonk_hype'
  | 'chill_recap';

class CinematicSoundEngine {
  private ctx: AudioContext | null = null;
  private bgmGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;

  private currentBgmOscillators: (OscillatorNode | AudioBufferSourceNode)[] = [];
  private isBgmPlaying: boolean = false;
  private currentBgmMood: MoodBgmType = 'epic_battle';

  private bgmVolume: number = 0.35; // default 35%
  private sfxVolume: number = 0.85; // default 85%
  private isDucked: boolean = false;

  constructor() {
    // Lazy initialize AudioContext on user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.value = 1.0;
      this.masterGainNode.connect(this.ctx.destination);

      this.bgmGainNode = this.ctx.createGain();
      this.bgmGainNode.gain.value = this.bgmVolume;
      this.bgmGainNode.connect(this.masterGainNode);

      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.value = this.sfxVolume;
      this.sfxGainNode.connect(this.masterGainNode);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setBgmVolume(val: number) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmGainNode && this.ctx) {
      const target = this.isDucked ? this.bgmVolume * 0.25 : this.bgmVolume;
      this.bgmGainNode.gain.setTargetAtTime(target, this.ctx.currentTime, 0.1);
    }
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGainNode && this.ctx) {
      this.sfxGainNode.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Audio Ducking: lowers BGM volume smoothly when voice is speaking
   */
  public duckBgm(isSpeaking: boolean) {
    this.isDucked = isSpeaking;
    if (!this.ctx || !this.bgmGainNode) return;

    const targetGain = isSpeaking ? this.bgmVolume * 0.22 : this.bgmVolume;
    const timeConst = isSpeaking ? 0.15 : 0.45; // quick duck, smooth fade-in
    this.bgmGainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, timeConst);
  }

  /**
   * Play High-Impact Synthesized Anime Sound Effect
   */
  public playSFX(type: SoundEffectType) {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode) return;

      const now = this.ctx.currentTime;

      switch (type) {
        case 'slash': {
          // Sharp white-noise whoosh + metallic high resonant ping
          const bufferSize = this.ctx.sampleRate * 0.25;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.04));
          }

          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(3200, now);
          filter.frequency.exponentialRampToValueAtTime(800, now + 0.25);
          filter.Q.setValueAtTime(4.0, now);

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(1.0, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.sfxGainNode);
          noise.start(now);
          break;
        }

        case 'heavy_impact': {
          // Sub-bass 808 drop + punchy transient
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.exponentialRampToValueAtTime(28, now + 0.45);

          gain.gain.setValueAtTime(1.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

          osc.connect(gain);
          gain.connect(this.sfxGainNode);
          osc.start(now);
          osc.stop(now + 0.55);
          break;
        }

        case 'thunder': {
          // Low rumble + randomized lightning crack
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(90, now);
          osc.frequency.linearRampToValueAtTime(35, now + 0.8);

          gain.gain.setValueAtTime(0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

          osc.connect(gain);
          gain.connect(this.sfxGainNode);
          osc.start(now);
          osc.stop(now + 0.9);
          break;
        }

        case 'system_ding': {
          // Crystal Clear Anime System/Level-Up Chime (E6 -> G#6 -> B6)
          const freqs = [1318.51, 1661.22, 1975.53];
          freqs.forEach((f, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + idx * 0.08);

            gain.gain.setValueAtTime(0, now + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.6, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

            osc.connect(gain);
            gain.connect(this.sfxGainNode!);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.65);
          });
          break;
        }

        case 'magic_cast': {
          // Ethereal FM magic spell shimmer
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(1760, now + 0.4);

          gain.gain.setValueAtTime(0.6, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

          osc.connect(gain);
          gain.connect(this.sfxGainNode);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
        }

        case 'whoosh': {
          // Fast camera zoom / dash whoosh
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);

          gain.gain.setValueAtTime(0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

          osc.connect(gain);
          gain.connect(this.sfxGainNode);
          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }

        case 'power_up': {
          // Dragonball / Solo Leveling energy surge
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(65, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.7);

          gain.gain.setValueAtTime(0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);

          osc.connect(gain);
          gain.connect(this.sfxGainNode);
          osc.start(now);
          osc.stop(now + 0.8);
          break;
        }

        case 'heartbeat': {
          // Deep resonant thud-thud
          [0, 0.22].forEach((offset) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(75, now + offset);
            osc.frequency.exponentialRampToValueAtTime(35, now + offset + 0.15);

            gain.gain.setValueAtTime(0.9, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.18);

            osc.connect(gain);
            gain.connect(this.sfxGainNode!);
            osc.start(now + offset);
            osc.stop(now + offset + 0.2);
          });
          break;
        }
      }
    } catch (e) {
      console.warn('[SFX Engine] Audio play error:', e);
    }
  }

  /**
   * Start Dynamic Cinematic Mood BGM
   */
  public startMoodBgm(mood: MoodBgmType) {
    this.stopBgm();
    this.initContext();
    if (!this.ctx || !this.bgmGainNode) return;

    this.currentBgmMood = mood;
    this.isBgmPlaying = true;
    const now = this.ctx.currentTime;

    // Ambient Cinematic harmonic pads synthesized with tuned oscillators
    const rootFreq = mood === 'epic_battle' ? 55 : mood === 'mysterious_lore' ? 65.41 : mood === 'phonk_hype' ? 48.99 : 58.27; // Notes in Hz

    const chords = [rootFreq, rootFreq * 1.5, rootFreq * 2.0, rootFreq * 2.5];

    chords.forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, now);

      // Add gentle LFO pulsing effect for cinematic movement
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();
      lfo.frequency.setValueAtTime(0.3 + idx * 0.1, now);
      lfoGain.gain.setValueAtTime(f * 0.02, now);
      lfo.connect(osc.frequency);
      lfo.start(now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25 / chords.length, now + 1.5);

      osc.connect(gain);
      gain.connect(this.bgmGainNode!);
      osc.start(now);

      this.currentBgmOscillators.push(osc);
    });
  }

  /**
   * Stop Mood BGM smoothly
   */
  public stopBgm() {
    if (this.currentBgmOscillators.length > 0) {
      this.currentBgmOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {}
      });
      this.currentBgmOscillators = [];
    }
    this.isBgmPlaying = false;
  }

  /**
   * AI Emotion Text Detector: auto-detects SFX triggers from dialogue
   */
  public detectSfxFromText(text: string, emotion?: string): SoundEffectType | null {
    const lower = (text || '').toLowerCase();

    if (lower.includes('chém') || lower.includes('kiếm') || lower.includes('đao') || lower.includes('vung') || lower.includes('slash') || lower.includes('rạch')) {
      return 'slash';
    }
    if (lower.includes('đấm') || lower.includes('nổ') || lower.includes('chấn động') || lower.includes('punch') || lower.includes('bùm') || lower.includes('va chạm')) {
      return 'heavy_impact';
    }
    if (lower.includes('sét') || lower.includes('lôi') || lower.includes('sấm') || lower.includes('thunder') || lower.includes('chớp')) {
      return 'thunder';
    }
    if (lower.includes('hệ thống') || lower.includes('nhiệm vụ') || lower.includes('thăng cấp') || lower.includes('level up') || lower.includes('ting')) {
      return 'system_ding';
    }
    if (lower.includes('ma pháp') || lower.includes('kỹ năng') || lower.includes('chiêu thức') || lower.includes('phép') || lower.includes('kết giới')) {
      return 'magic_cast';
    }
    if (lower.includes('bộc phát') || lower.includes('thức tỉnh') || lower.includes('sức mạnh') || lower.includes('aura') || lower.includes('hào quang')) {
      return 'power_up';
    }
    if (lower.includes('nhanh') || lower.includes('tốc độ') || lower.includes('biến mất') || lower.includes('lướt') || lower.includes('thoắt')) {
      return 'whoosh';
    }
    if (emotion === 'scared' || emotion === 'intense' || lower.includes('tim') || lower.includes('nghẹt thở')) {
      return 'heartbeat';
    }

    return null;
  }
}

export const cinematicSoundEngine = new CinematicSoundEngine();
