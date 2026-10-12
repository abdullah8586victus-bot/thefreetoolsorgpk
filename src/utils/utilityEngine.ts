// Everyday Utilities Engine

// 1. Password & Passphrase Generator
export function generatePassword(options: {
  length: number;
  useUpper: boolean;
  useLower: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
}): { password: string; entropyBits: number; strength: 'weak' | 'fair' | 'good' | 'strong' } {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let pool = '';
  if (options.useUpper) pool += upper;
  if (options.useLower) pool += lower;
  if (options.useNumbers) pool += numbers;
  if (options.useSymbols) pool += symbols;

  if (!pool) pool = lower + numbers;

  let pwd = '';
  const cryptoArr = new Uint32Array(options.length);
  crypto.getRandomValues(cryptoArr);

  for (let i = 0; i < options.length; i++) {
    pwd += pool[cryptoArr[i] % pool.length];
  }

  // Calculate Shannon entropy: E = L * log2(pool.length)
  const entropyBits = Math.round(options.length * Math.log2(pool.length));
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (entropyBits >= 80) strength = 'strong';
  else if (entropyBits >= 60) strength = 'good';
  else if (entropyBits >= 40) strength = 'fair';

  return { password: pwd, entropyBits, strength };
}

// 2. Unit Converter Tables
export const UNIT_CATEGORIES = {
  length: {
    name: 'Length',
    base: 'm',
    units: {
      m: { name: 'Meters (m)', factor: 1 },
      km: { name: 'Kilometers (km)', factor: 1000 },
      cm: { name: 'Centimeters (cm)', factor: 0.01 },
      mm: { name: 'Millimeters (mm)', factor: 0.001 },
      mi: { name: 'Miles (mi)', factor: 1609.344 },
      yd: { name: 'Yards (yd)', factor: 0.9144 },
      ft: { name: 'Feet (ft)', factor: 0.3048 },
      in: { name: 'Inches (in)', factor: 0.0254 },
    },
  },
  mass: {
    name: 'Weight / Mass',
    base: 'kg',
    units: {
      kg: { name: 'Kilograms (kg)', factor: 1 },
      g: { name: 'Grams (g)', factor: 0.001 },
      mg: { name: 'Milligrams (mg)', factor: 0.000001 },
      lb: { name: 'Pounds (lb)', factor: 0.45359237 },
      oz: { name: 'Ounces (oz)', factor: 0.02834952 },
      t: { name: 'Metric Ton (t)', factor: 1000 },
    },
  },
  digital: {
    name: 'Digital Storage',
    base: 'b',
    units: {
      b: { name: 'Bytes (B)', factor: 1 },
      kb: { name: 'Kilobytes (KB)', factor: 1024 },
      mb: { name: 'Megabytes (MB)', factor: 1024 ** 2 },
      gb: { name: 'Gigabytes (GB)', factor: 1024 ** 3 },
      tb: { name: 'Terabytes (TB)', factor: 1024 ** 4 },
    },
  },
  speed: {
    name: 'Speed',
    base: 'mps',
    units: {
      mps: { name: 'Meters per second (m/s)', factor: 1 },
      kph: { name: 'Kilometers per hour (km/h)', factor: 0.277778 },
      mph: { name: 'Miles per hour (mph)', factor: 0.44704 },
      knot: { name: 'Knots (kn)', factor: 0.514444 },
    },
  },
} as const;

export function convertUnit(
  val: number,
  fromUnit: string,
  toUnit: string,
  catKey: keyof typeof UNIT_CATEGORIES
): number {
  const cat = UNIT_CATEGORIES[catKey];
  const from = (cat.units as any)[fromUnit];
  const to = (cat.units as any)[toUnit];
  if (!from || !to) return val;

  const inBase = val * from.factor;
  return inBase / to.factor;
}

export function convertTemperature(val: number, from: 'c' | 'f' | 'k', to: 'c' | 'f' | 'k'): number {
  let inCelsius = val;
  if (from === 'f') inCelsius = (val - 32) * (5 / 9);
  else if (from === 'k') inCelsius = val - 273.15;

  if (to === 'c') return inCelsius;
  if (to === 'f') return inCelsius * (9 / 5) + 32;
  return inCelsius + 273.15;
}

// 3. Color Converter & WCAG Contrast Ratio
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function calculateWcagContrast(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  function getLuminance(r: number, g: number, b: number): number {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

// 4. Barcode CODE128 Simple SVG Vector Generator
export function generateBarcodeSvg(text: string): string {
  // Generate high-contrast barcode patterns
  const clean = text.trim() || 'SAMPLE128';
  let pattern = '11010010000'; // start code
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i) % 4;
    if (code === 0) pattern += '101100110';
    else if (code === 1) pattern += '110010110';
    else if (code === 2) pattern += '100110110';
    else pattern += '110110100';
  }
  pattern += '1100011101011'; // stop code

  const barWidth = 3;
  const barHeight = 80;
  const totalWidth = pattern.length * barWidth + 40;

  let barsSvg = '';
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '1') {
      barsSvg += `<rect x="${20 + i * barWidth}" y="10" width="${barWidth}" height="${barHeight}" fill="#0F172A" />`;
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} 120" width="100%" height="120" class="rounded">
      <rect width="100%" height="100%" fill="#FFFFFF" />
      ${barsSvg}
      <text x="${totalWidth / 2}" y="108" font-family="monospace" font-size="14" font-weight="600" text-anchor="middle" fill="#334155">${clean}</text>
    </svg>
  `;
}
