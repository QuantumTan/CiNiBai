/**
 * OKLab & OKLCH Perceptual Color Engine (§4.1)
 * Björn Ottosson's Oklab model implementation for accurate perceptual color clustering.
 * Enforces safety clamps (L ≤ 0.55) to guarantee canvas never lifts page above obsidian void.
 */

export interface OklabColor {
  L: number; // 0..1 (Lightness)
  a: number; // -0.4..0.4 (Green-Red)
  b: number; // -0.4..0.4 (Blue-Yellow)
}

export interface OklchColor {
  L: number; // Lightness: 0..1
  C: number; // Chroma: 0..0.4
  h: number; // Hue angle: 0..360
}

export interface RGBColor {
  r: number; // 0..255
  g: number; // 0..255
  b: number; // 0..255
}

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.min(Math.max(Math.round(v * 255), 0), 255);
}

export function rgbToOklab(r: number, g: number, b: number): OklabColor {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

export function oklabToOklch(lab: OklabColor): OklchColor {
  const C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L: lab.L, C, h };
}

export function oklabToRgb(lab: OklabColor): RGBColor {
  // Safety clamp on Lightness and Chroma (§4.1)
  const L = Math.min(Math.max(lab.L, 0.05), 0.55);
  const a = Math.min(Math.max(lab.a, -0.2), 0.2);
  const b = Math.min(Math.max(lab.b, -0.2), 0.2);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: linearToSrgb(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

/**
 * Cluster downsampled canvas pixels into k dominant chromatic palettes
 * Discards near-blacks (L < 0.12) and near-grays (Chroma < 0.035).
 */
export function clusterDominantOklab(
  data: Uint8ClampedArray,
  k: number = 3
): RGBColor[] {
  const candidates: { lab: OklabColor; chroma: number }[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lab = rgbToOklab(r, g, b);
    const lch = oklabToOklch(lab);

    // Discard near-black and near-gray
    if (lch.L > 0.12 && lch.C > 0.035) {
      candidates.push({ lab, chroma: lch.C });
    }
  }

  if (candidates.length === 0) {
    return [
      { r: 45, g: 35, b: 20 },
      { r: 25, g: 30, b: 45 },
      { r: 35, g: 20, b: 30 },
    ];
  }

  // Sort by chroma desc and pick distributed hues
  candidates.sort((a, b) => b.chroma - a.chroma);

  const selected: RGBColor[] = [];
  const step = Math.max(1, Math.floor(candidates.length / k));

  for (let i = 0; i < k; i++) {
    const target = candidates[Math.min(i * step, candidates.length - 1)];
    selected.push(oklabToRgb(target.lab));
  }

  return selected;
}
