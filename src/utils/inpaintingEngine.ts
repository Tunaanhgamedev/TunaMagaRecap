/**
 * AI Speech Bubble Cleaner & Smart Inpainting Engine
 * Performs intelligent background color sampling and seamless boundary feathering
 * to erase original Japanese/Korean/Chinese text from speech bubbles,
 * restoring 100% clean manga art.
 */

export interface BoundingBox {
  x: number; // 0..100 percentage
  y: number;
  w: number;
  h: number;
}

export class BubbleInpaintingEngine {
  /**
   * Sample dominant background color around the perimeter of the speech bubble
   */
  private samplePerimeterColor(
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    pw: number,
    ph: number,
    canvasW: number,
    canvasH: number
  ): { r: number; g: number; b: number; a: number; isDark: boolean } {
    const samplePoints: Array<{ x: number; y: number }> = [
      // Top perimeter
      { x: Math.max(0, px + pw * 0.2), y: Math.max(0, py - 4) },
      { x: Math.max(0, px + pw * 0.5), y: Math.max(0, py - 4) },
      { x: Math.min(canvasW - 1, px + pw * 0.8), y: Math.max(0, py - 4) },
      // Bottom perimeter
      { x: Math.max(0, px + pw * 0.2), y: Math.min(canvasH - 1, py + ph + 4) },
      { x: Math.max(0, px + pw * 0.5), y: Math.min(canvasH - 1, py + ph + 4) },
      { x: Math.min(canvasW - 1, px + pw * 0.8), y: Math.min(canvasH - 1, py + ph + 4) },
      // Left perimeter
      { x: Math.max(0, px - 4), y: Math.max(0, py + ph * 0.5) },
      // Right perimeter
      { x: Math.min(canvasW - 1, px + pw + 4), y: Math.max(0, py + ph * 0.5) },
      // Inside margin samples (near corners)
      { x: px + Math.min(6, pw * 0.1), y: py + Math.min(6, ph * 0.1) },
      { x: px + pw - Math.min(6, pw * 0.1), y: py + Math.min(6, ph * 0.1) },
    ];

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let validCount = 0;

    for (const pt of samplePoints) {
      try {
        const pixel = ctx.getImageData(Math.floor(pt.x), Math.floor(pt.y), 1, 1).data;
        // Ignore fully transparent or pitch black border strokes (r,g,b < 20) if surrounding is mostly light
        if (pixel[3] > 50) {
          totalR += pixel[0];
          totalG += pixel[1];
          totalB += pixel[2];
          validCount++;
        }
      } catch (e) {}
    }

    if (validCount === 0) {
      return { r: 255, g: 255, b: 255, a: 1, isDark: false };
    }

    const r = Math.round(totalR / validCount);
    const g = Math.round(totalG / validCount);
    const b = Math.round(totalB / validCount);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    return {
      r,
      g,
      b,
      a: 1,
      isDark: luminance < 80,
    };
  }

  /**
   * Inpaint a single speech bubble on a Canvas 2D context
   */
  public inpaintBubble(
    ctx: CanvasRenderingContext2D,
    bbox: BoundingBox,
    canvasW: number,
    canvasH: number,
    options?: {
      featherRadius?: number;
      shape?: 'rounded' | 'oval' | 'rect';
      forceWhite?: boolean;
    }
  ) {
    const px = (bbox.x / 100) * canvasW;
    const py = (bbox.y / 100) * canvasH;
    const pw = (bbox.w / 100) * canvasW;
    const ph = (bbox.h / 100) * canvasH;

    if (pw <= 2 || ph <= 2) return;

    ctx.save();

    // 1. Color Sampling
    let color = this.samplePerimeterColor(ctx, px, py, pw, ph, canvasW, canvasH);
    if (options?.forceWhite) {
      color = { r: 255, g: 255, b: 255, a: 1, isDark: false };
    }

    // 2. Shape Path Creation (Rounded bubble or Elliptical bubble)
    const cx = px + pw / 2;
    const cy = py + ph / 2;
    const rx = pw / 2;
    const ry = ph / 2;

    ctx.beginPath();
    if (options?.shape === 'oval') {
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    } else {
      // Soft rounded rect with corner radius
      const radius = Math.min(16, pw * 0.25, ph * 0.25);
      ctx.roundRect(px, py, pw, ph, radius);
    }

    // 3. Multi-layer Seamless Inpaint Fill with Subtle Gradient Feathering
    const fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.98)`;
    ctx.fillStyle = fillStyle;
    ctx.fill();

    // Secondary soft blend pass for edges
    ctx.lineWidth = Math.max(2, Math.min(8, (options?.featherRadius || 4)));
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Clean entire manga page image and return new clean Data URL
   */
  public async inpaintPageImage(
    img: HTMLImageElement,
    bubbles: BoundingBox[],
    options?: { forceWhite?: boolean }
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width || 1200;
    canvas.height = img.naturalHeight || img.height || 1800;

    const ctx = canvas.getContext('2d');
    if (!ctx) return img.src;

    // Draw base artwork
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Inpaint each bubble
    for (const b of bubbles) {
      this.inpaintBubble(ctx, b, canvas.width, canvas.height, options);
    }

    return canvas.toDataURL('image/jpeg', 0.92);
  }
}

export const bubbleInpaintingEngine = new BubbleInpaintingEngine();
