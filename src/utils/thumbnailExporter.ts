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

  // 2. Draw Multi-Character Layout
  await drawMainCharacters(ctx, width, height, config);

  // 3. Draw Overlay Effects (Speed lines, lightning, embers, magic runes, system hud)
  drawOverlayEffects(ctx, width, height, config);

  // 4. Draw Custom AI Elements (Floating skill cards, red attention arrow, aura, system windows)
  await drawAIElements(ctx, width, height, config);

  // 5. Draw Bottom Gradient Overlay
  const gradient = ctx.createLinearGradient(0, height * 0.52, 0, height);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.35, 'rgba(0, 0, 0, 0.7)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, height * 0.52, width, height * 0.48);

  // 6. Draw Vignette (Subtle cinematic depth)
  drawVignette(ctx, width, height, config.filterSettings?.vignette ?? 40);

  // 7. Draw Stickers (Optional)
  drawStickers(ctx, width, height, config);

  // 8. Draw Chapter Pill & Timestamp
  drawChapterPillAndTimestamp(ctx, width, height, config);

  // 9. Draw Giant Text at Bottom
  drawEpicTypographyBottom(ctx, width, height, config);

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

async function drawMainCharacters(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: ThumbnailConfig
) {
  const imagesUrls = config.characterImages || (config.characterImage ? [config.characterImage] : []);
  if (imagesUrls.length === 0) return;
  
  const count = imagesUrls.length;
  const sliceWidth = width / count;

  for (let i = 0; i < count; i++) {
    try {
      const img = await loadImage(imagesUrls[i]);
      const aspect = img.width / img.height;
      const zoom = config.slotZooms?.[i] || 1.0;
      const focus = config.slotFocus?.[i] || 'top';
      
      // Calculate how to cover the slice width & full height (object-cover) with zoom
      let targetH = height * zoom;
      let targetW = targetH * aspect;
      
      if (targetW < sliceWidth) {
        targetW = sliceWidth * zoom;
        targetH = targetW / aspect;
      }
      
      let srcW = (sliceWidth / targetW) * img.width;
      let srcH = (height / targetH) * img.height;
      let srcX = (img.width - srcW) / 2;
      
      let srcY = 0;
      if (focus === 'center') {
        srcY = Math.max(0, (img.height - srcH) / 2);
      } else if (focus === 'bottom') {
        srcY = Math.max(0, img.height - srcH);
      }

      ctx.save();
      
      // Draw border separator if not first
      if (i > 0) {
        ctx.beginPath();
        ctx.moveTo(i * sliceWidth, 0);
        ctx.lineTo(i * sliceWidth, height);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
      }
      
      ctx.beginPath();
      ctx.rect(i * sliceWidth, 0, sliceWidth, height);
      ctx.clip();
      
      // Filters
      const b = config.filterSettings?.brightness ?? 105;
      const c = config.filterSettings?.contrast ?? 125;
      const s = config.filterSettings?.saturation ?? 130;
      ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
      
      ctx.drawImage(img, srcX, srcY, srcW, srcH, i * sliceWidth, 0, sliceWidth, height);
      
      ctx.restore();
    } catch (err) {
      console.warn('Could not draw character image on canvas:', err);
    }
  }
}

async function drawAIElements(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: ThumbnailConfig
) {
  if (!config.aiElements || config.aiElements.length === 0) return;

  for (const elem of config.aiElements) {
    try {
      const img = await loadImage(elem.url);
      const posX = (elem.x / 100) * width;
      const posY = (elem.y / 100) * height;
      const baseW = width * 0.35 * (elem.scale || 1.0);
      const baseH = (baseW / (img.width || 1)) * (img.height || 1);

      ctx.save();
      ctx.globalAlpha = elem.opacity ?? 0.9;
      if (elem.blendMode && elem.blendMode !== 'normal') {
        ctx.globalCompositeOperation = elem.blendMode as GlobalCompositeOperation;
      }
      ctx.drawImage(img, posX - baseW / 2, posY - baseH / 2, baseW, baseH);
      ctx.restore();
    } catch (err) {
      console.warn('Failed to draw AI Element on canvas:', elem.name, err);
    }
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

function drawChapterPillAndTimestamp(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: ThumbnailConfig
) {
  ctx.save();
  // Pill Top-Left
  const chapterText = config.badge || 'CHAP 1';
  ctx.font = '900 32px "Arial Black", Impact, sans-serif';
  const textWidth = ctx.measureText(chapterText).width;
  
  ctx.fillStyle = '#dc2626'; // red-600
  ctx.shadowColor = 'rgba(220, 38, 38, 0.8)';
  ctx.shadowBlur = 10;
  roundRect(ctx, 40, 40, textWidth + 40, 56, 28);
  ctx.fill();
  
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.stroke();
  
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(chapterText, 40 + (textWidth + 40) / 2, 40 + 28);

  // Progression Badge Top-Right (Optional)
  if (config.progressionBadge) {
    const progText = config.progressionBadge.toUpperCase();
    ctx.font = '900 28px "Arial Black", Impact, sans-serif';
    const progWidth = ctx.measureText(progText).width;
    const progX = width - progWidth - 70;
    const progY = 40;

    ctx.fillStyle = '#0f172a';
    ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
    ctx.shadowBlur = 15;
    roundRect(ctx, progX, progY, progWidth + 36, 56, 12);
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#06b6d4';
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(progText, progX + (progWidth + 36) / 2, progY + 28);
  }

  ctx.restore();
}

function drawEpicTypographyBottom(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: ThumbnailConfig
) {
  const isPortrait = config.aspectRatio === '9:16';
  
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  
  let currentY = height - 40; // start from bottom up
  
  // 1. Draw Subtitle (above bottom margin)
  if (config.subtitle) {
    const subtitle = config.subtitle.toUpperCase();
    const subFontSize = isPortrait ? 32 : 46;
    ctx.font = `900 ${subFontSize}px "Arial Black", Montserrat, sans-serif`;
    
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#000000';
    ctx.strokeText(subtitle, width / 2, currentY);
    
    ctx.fillStyle = config.glowColor || '#38bdf8';
    ctx.fillText(subtitle, width / 2, currentY);
    
    currentY -= (subFontSize + 10);
  }

  // 2. Draw 3D Main Title
  if (config.mainTitle) {
    const title = config.mainTitle.toUpperCase();
    // Use clamp-like logic for font size
    const fontSize = isPortrait ? 60 : Math.min(140, Math.max(80, Math.floor(width / title.length * 1.4)));
    ctx.font = `900 ${fontSize}px "Arial Black", Impact, sans-serif`;
    
    // Heavy black outline / stroke
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#000000';
    ctx.lineJoin = 'round';
    ctx.strokeText(title, width / 2, currentY);
    
    // 3D Shadow Layers (extruded downwards slightly)
    ctx.fillStyle = '#000000';
    for (let offset = 8; offset >= 1; offset--) {
      ctx.fillText(title, width / 2, currentY + offset);
    }
    
    // Gradient fill or flat color based on style
    if (config.titleStyle === 'fiery_orange') {
      ctx.fillStyle = '#fbbf24';
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.fillText(title, width / 2, currentY);
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
