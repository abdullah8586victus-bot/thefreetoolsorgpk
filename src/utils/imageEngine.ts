// Client-side Canvas Image Engine

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  sharpenAmount?: number; // 0 to 5
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // -100 to 100
  sepia?: boolean;
  grayscale?: boolean;
  invert?: boolean;
}

// Load Image from File or URL into HTMLImageElement
export function loadImage(src: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;

    if (src instanceof File) {
      const reader = new FileReader();
      reader.onload = e => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(src);
    } else {
      img.src = src;
    }
  });
}

// 1. Unblur & Sharpen Photo (Convolution Unsharp Masking)
export function applyPhotoUnblur(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  sharpness: number = 2.0
) {
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const output = ctx.createImageData(width, height);
  const outData = output.data;

  // Unsharp mask convolution kernel
  // [  0, -k,  0 ]
  // [ -k, 1+4k, -k ]
  // [  0, -k,  0 ]
  const k = Math.min(Math.max(sharpness * 0.4, 0.1), 3.0);
  const center = 1 + 4 * k;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        const top = ((y - 1) * width + x) * 4 + c;
        const bottom = ((y + 1) * width + x) * 4 + c;
        const left = (y * width + (x - 1)) * 4 + c;
        const right = (y * width + (x + 1)) * 4 + c;
        const cur = idx + c;

        const val =
          data[cur] * center -
          (data[top] + data[bottom] + data[left] + data[right]) * k;

        outData[cur] = Math.min(255, Math.max(0, val));
      }
      outData[idx + 3] = data[idx + 3]; // Alpha
    }
  }

  // Copy borders
  for (let x = 0; x < width; x++) {
    for (let c = 0; c < 4; c++) {
      outData[x * 4 + c] = data[x * 4 + c];
      outData[((height - 1) * width + x) * 4 + c] = data[((height - 1) * width + x) * 4 + c];
    }
  }
  for (let y = 0; y < height; y++) {
    for (let c = 0; c < 4; c++) {
      outData[(y * width) * 4 + c] = data[(y * width) * 4 + c];
      outData[(y * width + (width - 1)) * 4 + c] = data[(y * width + (width - 1)) * 4 + c];
    }
  }

  ctx.putImageData(output, 0, 0);
}

// 2. Resize Image
export function resizeImageCanvas(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(targetWidth));
  canvas.height = Math.max(1, Math.round(targetHeight));
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
  return canvas;
}

// 3. Compress Image and Return Blob + Compression stats
export function compressCanvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'image/jpeg' | 'image/webp' | 'image/png' = 'image/jpeg',
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas compression failed'));
      },
      format,
      format === 'image/png' ? undefined : quality
    );
  });
}

// 4. Background Color Masker / Chroma Cutout
export function removeBackgroundColor(
  canvas: HTMLCanvasElement,
  targetHex: string,
  tolerance: number = 30
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Convert Hex to RGB
  const hex = targetHex.replace('#', '');
  const tr = parseInt(hex.substring(0, 2), 16) || 255;
  const tg = parseInt(hex.substring(2, 4), 16) || 255;
  const tb = parseInt(hex.substring(4, 6), 16) || 255;

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const tolSq = (tolerance * 2.55) ** 2;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const distSq = (r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2;

    if (distSq <= tolSq) {
      data[i + 3] = 0; // Transparent
    } else if (distSq <= tolSq * 1.5) {
      // Feather edge
      const factor = (distSq - tolSq) / (tolSq * 0.5);
      data[i + 3] = Math.round(data[i + 3] * factor);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

// 5. Photo Filters (Brightness, Contrast, Saturation, Sepia, Grayscale)
export function applyCanvasFilters(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    brightness?: number; // -100 to 100
    contrast?: number;   // -100 to 100
    saturation?: number; // -100 to 100
    sepia?: boolean;
    grayscale?: boolean;
    invert?: boolean;
    vintage?: boolean;
  }
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const b = (options.brightness || 0) * 1.5;
  const c = (options.contrast || 0);
  const contrastFactor = (259 * (c + 255)) / (255 * (259 - c));
  const sat = 1 + (options.saturation || 0) / 100;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let bVal = data[i + 2];

    // Brightness
    r += b;
    g += b;
    bVal += b;

    // Contrast
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    bVal = contrastFactor * (bVal - 128) + 128;

    // Grayscale
    if (options.grayscale) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * bVal;
      r = gray;
      g = gray;
      bVal = gray;
    } else if (options.sepia) {
      const tr = 0.393 * r + 0.769 * g + 0.189 * bVal;
      const tg = 0.349 * r + 0.686 * g + 0.168 * bVal;
      const tb = 0.272 * r + 0.534 * g + 0.131 * bVal;
      r = tr;
      g = tg;
      bVal = tb;
    } else if (options.vintage) {
      r = r * 1.1 + 10;
      g = g * 0.95;
      bVal = bVal * 0.85;
    } else if (sat !== 1) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * bVal;
      r = gray + (r - gray) * sat;
      g = gray + (g - gray) * sat;
      bVal = gray + (bVal - gray) * sat;
    }

    if (options.invert) {
      r = 255 - r;
      g = 255 - g;
      bVal = 255 - bVal;
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, bVal));
  }

  ctx.putImageData(imgData, 0, 0);
}

// 6. Rotate and Flip Canvas
export function transformCanvasOrientation(
  img: HTMLImageElement,
  angleDegrees: number,
  flipH: boolean,
  flipV: boolean
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const rad = (angleDegrees * Math.PI) / 180;
  const isPerpendicular = Math.abs(angleDegrees % 180) === 90;

  canvas.width = isPerpendicular ? img.height : img.width;
  canvas.height = isPerpendicular ? img.width : img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return canvas;
}

// 7. Dominant Palette Extractor
export function extractDominantPalette(img: HTMLImageElement, maxColors: number = 6): string[] {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return ['#2563EB', '#1E293B', '#F8FAFC'];

  ctx.drawImage(img, 0, 0, 100, 100);
  const data = ctx.getImageData(0, 0, 100, 100).data;
  const colorBuckets: { [key: string]: number } = {};

  for (let i = 0; i < data.length; i += 16) {
    if (data[i + 3] < 128) continue; // Skip transparent
    // Quantize to step of 32
    const r = Math.round(data[i] / 32) * 32;
    const g = Math.round(data[i + 1] / 32) * 32;
    const b = Math.round(data[i + 2] / 32) * 32;
    const key = `${Math.min(255, r)},${Math.min(255, g)},${Math.min(255, b)}`;
    colorBuckets[key] = (colorBuckets[key] || 0) + 1;
  }

  const sorted = Object.entries(colorBuckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxColors);

  return sorted.map(([rgbStr]) => {
    const [r, g, b] = rgbStr.split(',').map(Number);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  });
}
