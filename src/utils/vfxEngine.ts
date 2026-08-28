/**
 * 2.5D Motion Comic & VFX Particle Layer (60 FPS Canvas Renderer)
 * Renders Anime Ember Sparks, Energy Aura Smoke, Speed Lines, Eye Flare Glow, and Rain Lightning
 */

export type VFXType = 'none' | 'ember_sparks' | 'aura_smoke' | 'speed_lines' | 'eye_flare' | 'rain_storm';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

export class MotionComicVFXEngine {
  private particles: Particle[] = [];
  private activeVFX: VFXType = 'none';

  public setVFX(type: VFXType) {
    if (this.activeVFX !== type) {
      this.activeVFX = type;
      this.particles = [];
    }
  }

  public getVFX(): VFXType {
    return this.activeVFX;
  }

  /**
   * Render VFX overlay onto canvas context at current timestamp
   */
  public renderVFX(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    vfxType: VFXType = this.activeVFX,
    timestamp: number = Date.now()
  ) {
    if (vfxType === 'none') return;

    ctx.save();

    switch (vfxType) {
      case 'ember_sparks':
        this.renderEmberSparks(ctx, width, height, timestamp);
        break;
      case 'aura_smoke':
        this.renderAuraSmoke(ctx, width, height, timestamp);
        break;
      case 'speed_lines':
        this.renderSpeedLines(ctx, width, height, timestamp);
        break;
      case 'eye_flare':
        this.renderEyeFlare(ctx, width, height, timestamp);
        break;
      case 'rain_storm':
        this.renderRainStorm(ctx, width, height, timestamp);
        break;
    }

    ctx.restore();
  }

  private renderEmberSparks(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) {
    // Spawn new embers
    if (this.particles.length < 45) {
      const colors = ['#ff4500', '#ff8c00', '#ffd700', '#ff2200'];
      this.particles.push({
        x: Math.random() * width,
        y: height + Math.random() * 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(Math.random() * 2.5 + 1.2),
        size: Math.random() * 3.5 + 1.5,
        opacity: Math.random() * 0.8 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: Math.random() * 120 + 80,
      });
    }

    // Update & draw particles
    this.particles = this.particles.filter((p) => {
      p.life++;
      p.x += p.vx + Math.sin(time * 0.003 + p.y * 0.05) * 0.5;
      p.y += p.vy;

      const progress = p.life / p.maxLife;
      const alpha = Math.sin(progress * Math.PI) * p.opacity;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      return p.life < p.maxLife && p.y > -20;
    });
  }

  private renderAuraSmoke(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) {
    // Pulsing energy vignette
    const pulse = (Math.sin(time * 0.004) + 1) * 0.5;
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.2,
      width / 2,
      height / 2,
      width * 0.75
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, `rgba(139, 92, 246, ${0.12 + pulse * 0.1})`);
    gradient.addColorStop(1, `rgba(67, 56, 202, ${0.25 + pulse * 0.15})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Floating subtle mana orbs
    if (this.particles.length < 25) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(Math.random() * 0.8 + 0.2),
        size: Math.random() * 8 + 4,
        opacity: Math.random() * 0.4 + 0.1,
        color: '#c084fc',
        life: 0,
        maxLife: 150,
      });
    }

    this.particles = this.particles.filter((p) => {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;

      const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * p.opacity;
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#a855f7';
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      return p.life < p.maxLife;
    });
  }

  private renderSpeedLines(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) {
    const lineCount = 14;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2.5;

    for (let i = 0; i < lineCount; i++) {
      const isLeft = i % 2 === 0;
      const startX = isLeft ? 0 : width;
      const targetX = isLeft ? width * 0.35 + Math.random() * 40 : width * 0.65 - Math.random() * 40;
      const y = (i / lineCount) * height + ((time * 0.2) % (height / lineCount));

      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(targetX, y + (Math.random() - 0.5) * 15);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderEyeFlare(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) {
    // Intense anime eye glare in center area
    const cx = width * 0.5;
    const cy = height * 0.42;
    const flarePulse = (Math.sin(time * 0.008) + 1) * 0.5;

    ctx.save();
    // Neon Red/Cyan cross streak
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.7 + flarePulse * 0.3})`;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 20;
    ctx.lineWidth = 3;

    // Horizontal flare streak
    ctx.beginPath();
    ctx.moveTo(cx - 140 * (1 + flarePulse * 0.3), cy);
    ctx.lineTo(cx + 140 * (1 + flarePulse * 0.3), cy);
    ctx.stroke();

    // Center bright core
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, 'rgba(239, 68, 68, 0.9)');
    coreGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderRainStorm(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number
  ) {
    // Rain streaks
    ctx.save();
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
    ctx.lineWidth = 1.2;

    for (let i = 0; i < 40; i++) {
      const rx = (i * 37 + (time * 0.4) % width) % width;
      const ry = (i * 53 + (time * 1.2) % height) % height;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 8, ry + 25);
      ctx.stroke();
    }

    // Occasional lightning flash
    if (Math.random() < 0.02) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }
}

export const motionComicVFXEngine = new MotionComicVFXEngine();
