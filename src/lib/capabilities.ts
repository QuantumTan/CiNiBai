/**
 * Apple Optical Material System - Capability Tier Engine (§9)
 * Detects browser capabilities once on boot and exposes `data-tier="a|b|c"` on `<html>`.
 * 
 * Tier A (Full): Chromium/Safari desktop with capable GPU (refraction lens, pointer tilt, ambilight, magnification).
 * Tier B (Standard): Safari/Firefox, mid-tier devices (bevels + vibrancy + fresnel; ambient canvas at lower rate).
 * Tier C (Lite): No backdrop-filter, low memory, prefers-reduced-transparency/motion (opaque obsidian #0c0e14).
 */

export type CapabilityTier = 'a' | 'b' | 'c';

export interface SystemCapabilities {
  tier: CapabilityTier;
  supportsBackdropFilter: boolean;
  supportsSvgBackdropFilter: boolean;
  supportsCornerShape: boolean;
  reducedMotion: boolean;
  reducedTransparency: boolean;
  highContrast: boolean;
  deviceMemory: number;
  hardwareConcurrency: number;
}

let cachedCapabilities: SystemCapabilities | null = null;

export function detectCapabilities(): SystemCapabilities {
  if (typeof window === 'undefined') {
    return {
      tier: 'b',
      supportsBackdropFilter: true,
      supportsSvgBackdropFilter: false,
      supportsCornerShape: false,
      reducedMotion: false,
      reducedTransparency: false,
      highContrast: false,
      deviceMemory: 8,
      hardwareConcurrency: 8,
    };
  }

  if (cachedCapabilities) return cachedCapabilities;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
  const highContrast = window.matchMedia('(prefers-contrast: more)').matches;

  const supportsBackdropFilter =
    CSS.supports('backdrop-filter', 'blur(10px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(10px)');

  // Chromium-only supports SVG filter references inside backdrop-filter
  const isChromium =
    'chrome' in window &&
    (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Chromium'));
  const supportsSvgBackdropFilter = isChromium && supportsBackdropFilter;

  // Experimental squircle CSS property check
  const supportsCornerShape = CSS.supports('corner-shape', 'squircle');

  const nav = navigator as Navigator & { deviceMemory?: number };
  const deviceMemory = nav.deviceMemory || 8;
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;

  let tier: CapabilityTier = 'a';

  if (!supportsBackdropFilter || reducedTransparency || deviceMemory < 4 || hardwareConcurrency < 4) {
    tier = 'c';
  } else if (!supportsSvgBackdropFilter || deviceMemory < 8) {
    tier = 'b';
  } else {
    tier = 'a';
  }

  cachedCapabilities = {
    tier,
    supportsBackdropFilter,
    supportsSvgBackdropFilter,
    supportsCornerShape,
    reducedMotion,
    reducedTransparency,
    highContrast,
    deviceMemory,
    hardwareConcurrency,
  };

  // Mount dataset on root for CSS targeting
  if (document.documentElement) {
    document.documentElement.dataset.tier = tier;
    if (reducedMotion) document.documentElement.dataset.reducedMotion = 'true';
    if (reducedTransparency) document.documentElement.dataset.reducedTransparency = 'true';
    if (highContrast) document.documentElement.dataset.highContrast = 'true';
  }

  return cachedCapabilities;
}

export function getCapabilities(): SystemCapabilities {
  return cachedCapabilities ?? detectCapabilities();
}
