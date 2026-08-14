import { ThumbnailConfig } from '../types/studio';

/**
 * High-Resolution (1920x1080) 2D Canvas Exporter for Manga Recap YouTube Thumbnails
 * Composites layered art, AI effects, glowing auras, metallic 3D typography, and CTR badges.
 */
export async function exportThumbnailToBlob(config: ThumbnailConfig): Promise<Blob | null> {
  const isPortrait = config.aspectRatio === '9:16';
  const isSquare = config.aspectRatio === '1:1';

  const width = isPortrait ? 1080 : isSquare ? 1080 : 1920;
  const height = isPortrait ? 1920 : isSquare ? 1080 : 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 1. Draw Background
  drawBackground(ctx, width, height, config);

  // 2. Draw Secondary AI Artwork / Monster / Background image if available
  if (config.aiArtworkUrl) {
    await drawImageLayer(ctx, config.aiArtworkUrl, 0, 0, width, height, 0.6, 'screen');
  }
  if (config.characterSecondaryImage) {
    const secX = isPortrait ? width * 0.1 : width * 0.35;
    const secY = height * 0.15;
    const secW = width * 0.55;
    const secH = height * 0.8;
    await drawImageLayer(ctx, config.characterSecondaryImage, secX, secY, secW, secH, 0.75, 'screen');
  }

  // 3. Draw Overlays & AI Effects (Speed lines, Lightning, Embers, Magic Circle, System HUD)
  drawOverlayEffects(ctx, width, height, config);

  // 4. Draw Main Character Cutout
  if (config.characterImage) {
    await drawMainCharacter(ctx, width, height, config);
  }

  // 5. Draw Vignette & Lighting Contrast
  drawVignette(ctx, width, height, config.filterSettings?.vignette ?? 40);

  // 6. Draw AI Visual Elements (Custom elements)
  if (config.aiElements && config.aiElements.length > 0) {
    for (const elem of config.aiElements) {
      const elemX = (elem.x / 100) * width;
      const elemY = (elem.y / 100) * height;
      const elemW = (width * 0.4) * elem.scale;
      const elemH = (height * 0.4) * elem.scale;
      await drawImageLayer(ctx, elem.url, elemX - elemW / 2, elemY - elemH / 2, elemW, elemH, elem.opacity, elem.blendMode || 'screen');
    }
  }

  // 7. Draw Stickers & Badges
  drawStickers(ctx, width, height, config);

  // 8. Draw 3D Metallic / Glowing Typography
  drawEpicTypography(ctx, width, height, config);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.98);
  });
}

export async function downloadThumbnailImage(
  config: ThumbnailConfig,
  fileName: string = 'YouTube-Thumbnail-1920x1080.png'
): Promise<boolean> {
  try {
    const blob = await exportThumbnailToBlob(config);
    if (!blob) return false;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch (err) {
    console.error('Failed to export thumbnail canvas:', err);
    return false;
  }
}

// -------------------------------------------------------------
// CANVAS DRAWING HELPERS
// -------------------------------------------------------------

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: ThumbnailConfig
) {
  // Base dark gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);

  switch (config.theme) {
    case 'solo_awakening':
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#082f49');
      grad.addColorStop(1, '#0c4a6e');
      break;
    case 'dark_monarch':
      grad.addColorStop(0, '#030712');
      grad.addColorStop(0.5, '#3b0764');
      grad.addColorStop(1, '#111827');
      break;
    case 'golden_immortal':
      grad.addColorStop(0, '#451a03');
      grad.addColorStop(0.5, '#1c1917');
      grad.addColorStop(1, '#78350f');
      break;
    case 'magic_overlord':
      grad.addColorStop(0, '#3b0764');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#0f172a');
      break;
    case 'blood_fury':
      grad.addColorStop(0, '#450a0a');
      grad.addColorStop(0.5, '#18181b');
      grad.addColorStop(1, '#09090b');
      break;
    case 'speed_action':
      grad.addColorStop(0, '#431407');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#7c2d12');
      break;
    case 'cyber_system':
      grad.addColorStop(0, '#022c22');
      grad.addColorStop(0.5, '#020617');
      grad.addColorStop(1, '#064e3b');
      break;
    default:
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#082f49');
      break;
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Add ambient color bursts
  const glowX = width * 0.75;
  const glowY = height * 0.5;
  const radial = ctx.createRadialGradient(glowX, glowY, 50, glowX, glowY, width * 0.6);
  radial.addColorStop(0, (config.glowColor || '#06b6d4') + '99');
  radial.addColorStop(0.6, (config.glowColor || '#06b6d4') + '33');
  radial.addColorStop(1, 'transparent');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);
}

async function drawImageLayer(
  ctx: CanvasRenderingContext2D,
  src: string,
  x: number,
  y: number,
  w: number,
  h: number,
  opacity: number = 1,
  blendMode: string = 'normal'
) {
  if (!src) return;
  try {
    const img = await loadImage(src);
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  } catch (err) {
    console.warn('Failed to load image layer for canvas:', src, err);
  }
}

async function drawMainCharacter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: ThumbnailConfig
) {
  try {
    const img = await loadImage(config.characterImage);
    const scale = (config.characterScale || 100) / 100;
    const aspect = img.width / img.height;

    let targetH = height * 0.95 * scale;
    let targetW = targetH * aspect;

    let posX = width - targetW - width * 0.03;
    let posY = height - targetH;

    if (config.characterPosition === 'left') {
      posX = width * 0.03;
    } else if (config.characterPosition === 'center') {
      posX = (width - targetW) / 2;
    }

    ctx.save();

    // Character outer glowing rim
    if (config.characterGlow) {
      ctx.shadowColor = config.glowColor || '#38bdf8';
      ctx.shadowBlur = 40;
    }

    if (config.characterBlend && config.characterBlend !== 'normal') {
      ctx.globalCompositeOperation = config.characterBlend as GlobalCompositeOperation;
    }

    // Apply brightness & contrast filters
    const b = config.filterSettings?.brightness ?? 100;
    const c = config.filterSettings?.contrast ?? 100;
    const s = config.filterSettings?.saturation ?? 100;
    ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;

    ctx.drawImage(img, posX, posY, targetW, targetH);
    ctx.restore();
  } catch (err) {
    console.warn('Could not draw character image on canvas:', err);
  }
}

function drawOverlayEffects(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: ThumbnailConfig
) {
  const effect = config.overlayEffect || 'lightning_storm';

  if (effect === 'speed_lines') {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    const centerX = width * 0.65;
    const centerY = height * 0.5;

    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const r1 = width * 0.25 + Math.random() * 80;
      const r2 = width * 0.85;
      ctx.beginPath();
      ctx.moveTo(centerX + Math.cos(angle) * r1, centerY + Math.sin(angle) * r1);
      ctx.lineTo(centerX + Math.cos(angle) * r2, centerY + Math.sin(angle) * r2);
      ctx.stroke();
    }
    ctx.restore();
  } else if (effect === 'lightning_storm') {
    ctx.save();
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 18;
    drawLightningBranch(ctx, width * 0.4, 0, width * 0.7, height * 0.6);
    drawLightningBranch(ctx, width * 0.8, 0, width * 0.9, height * 0.8);
    ctx.restore();
  } else if (effect === 'flaming_embers') {
    ctx.save();
    for (let i = 0; i < 45; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 6 + 2;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#f97316');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (effect === 'magic_runes') {
    ctx.save();
    ctx.strokeStyle = '#d946ef';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#f472b6';
    ctx.shadowBlur = 20;
    const cx = width * 0.75;
    const cy = height * 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, height * 0.38, 0, Math.PI * 2);
    ctx.arc(cx, cy, height * 0.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if (effect === 'system_hud') {
    ctx.save();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.strokeRect(width * 0.03, height * 0.05, width * 0.94, height * 0.9);
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(width * 0.03, height * 0.05, 120, 4);
    ctx.fillRect(width * 0.03, height * 0.05, 4, 120);
    ctx.restore();
  }
}

function drawLightningBranch(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  let curX = x1;
  let curY = y1;
  ctx.beginPath();
  ctx.moveTo(curX, curY);

  const steps = 7;
  for (let i = 1; i <= steps; i++) {
    const targetX = x1 + ((x2 - x1) * i) / steps + (Math.random() - 0.5) * 60;
    const targetY = y1 + ((y2 - y1) * i) / steps + (Math.random() - 0.5) * 30;
    ctx.lineTo(targetX, targetY);
    curX = targetX;
    curY = targetY;
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawVignette(ctx: CanvasRenderingContext2D, width: number, height: number, strength: number) {
  if (strength <= 0) return;
  const radius = Math.max(width, height) * 0.75;
  const radial = ctx.createRadialGradient(width / 2, height / 2, radius * 0.3, width / 2, height / 2, radius);
  const alpha = Math.min(1, Math.max(0, strength / 100));
  radial.addColorStop(0, 'transparent');
  radial.addColorStop(0.7, `rgba(0, 0, 0, ${alpha * 0.5})`);
  radial.addColorStop(1, `rgba(0, 0, 0, ${alpha * 0.95})`);

  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);
}

function drawStickers(ctx: CanvasRenderingContext2D, width: number, height: number, config: ThumbnailConfig) {
  const stickers = config.activeStickers || [];
  if (stickers.length === 0) return;

  ctx.save();
  stickers.forEach((stk, idx) => {
    const x = width * 0.05 + idx * 260;
    const y = height * 0.12;

    // Draw sticker pill
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;
    roundRect(ctx, x, y - 28, 230, 38, 8);
    ctx.fill();

    // Sticker text
    ctx.font = '900 18px "Arial Black", Montserrat, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stk, x + 115, y - 9);
  });
  ctx.restore();
}

function drawEpicTypography(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: ThumbnailConfig
) {
  const isPortrait = config.aspectRatio === '9:16';
  const leftX = width * 0.05;
  let currentY = isPortrait ? height * 0.55 : height * 0.36;

  ctx.save();

  // 1. Draw Badge
  if (config.badge) {
    ctx.save();
    ctx.translate(leftX, currentY);
    ctx.rotate(-0.03); // Slight energetic slant

    // Badge background box
    ctx.fillStyle = getBadgeColor(config.badgeStyle || 'gold_metallic');
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    roundRect(ctx, 0, -38, Math.min(width * 0.55, 380), 52, 10);
    ctx.fill();

    // Badge text
    ctx.font = '900 24px "Arial Black", Impact, sans-serif';
    ctx.fillStyle = '#020617';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.badge.toUpperCase(), 16, -12);
    ctx.restore();

    currentY += 80;
  }

  // 2. Draw 3D Main Title
  if (config.mainTitle) {
    const title = config.mainTitle.toUpperCase();
    const fontSize = isPortrait ? 68 : Math.min(94, Math.max(54, Math.floor(width / title.length * 1.5)));
    ctx.font = `italic 900 ${fontSize}px "Arial Black", Impact, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    // Extruded 3D Shadow Layers
    ctx.fillStyle = '#000000';
    for (let offset = 12; offset >= 1; offset--) {
      ctx.fillText(title, leftX + offset, currentY + offset);
    }

    // Heavy black outline
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#000000';
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 2;
    ctx.strokeText(title, leftX, currentY);

    // Gradient fill on text
    const titleGrad = ctx.createLinearGradient(leftX, currentY, leftX, currentY + fontSize);
    applyTitleGradient(titleGrad, config.titleStyle || 'gold_3d');
    ctx.fillStyle = titleGrad;
    ctx.fillText(title, leftX, currentY);

    currentY += fontSize + 18;
  }

  // 3. Draw Subtitle
  if (config.subtitle) {
    const subtitle = config.subtitle.toUpperCase();
    const subFontSize = isPortrait ? 36 : 46;
    ctx.font = `900 ${subFontSize}px "Arial Black", Montserrat, sans-serif`;
    ctx.textBaseline = 'top';

    // Background highlight bar for subtitle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    const textWidth = ctx.measureText(subtitle).width;
    roundRect(ctx, leftX - 10, currentY - 6, textWidth + 24, subFontSize + 14, 8);
    ctx.fill();

    // Heavy outline
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(subtitle, leftX, currentY);

    // Glowing text fill
    ctx.fillStyle = config.glowColor || '#67e8f9';
    ctx.fillText(subtitle, leftX, currentY);
  }

  ctx.restore();
}

function getBadgeColor(style: string): string {
  switch (style) {
    case 'gold_metallic':
      return '#fbbf24';
    case 'neon_cyan':
      return '#06b6d4';
    case 'blood_red':
      return '#ef4444';
    case 'flaming_orange':
      return '#f97316';
    case 'purple_void':
      return '#c084fc';
    case 'emerald_god':
      return '#34d399';
    default:
      return '#fbbf24';
  }
}

function applyTitleGradient(grad: CanvasGradient, style: string) {
  switch (style) {
    case 'gold_3d':
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.5, '#fbbf24');
      grad.addColorStop(1, '#b45309');
      break;
    case 'fiery_orange':
      grad.addColorStop(0, '#ffedd5');
      grad.addColorStop(0.5, '#fb923c');
      grad.addColorStop(1, '#c2410c');
      break;
    case 'electric_blue':
      grad.addColorStop(0, '#e0f2fe');
      grad.addColorStop(0.4, '#38bdf8');
      grad.addColorStop(1, '#0369a1');
      break;
    case 'crimson_blood':
      grad.addColorStop(0, '#fee2e2');
      grad.addColorStop(0.5, '#ef4444');
      grad.addColorStop(1, '#7f1d1d');
      break;
    case 'neon_cyan':
      grad.addColorStop(0, '#cffafe');
      grad.addColorStop(0.5, '#22d3ee');
      grad.addColorStop(1, '#0891b2');
      break;
    case 'toxic_green':
      grad.addColorStop(0, '#dcfce7');
      grad.addColorStop(0.5, '#4ade80');
      grad.addColorStop(1, '#15803d');
      break;
    default:
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#f1f5f9');
      grad.addColorStop(1, '#94a3b8');
      break;
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
