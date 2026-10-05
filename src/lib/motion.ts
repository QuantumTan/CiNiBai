/**
 * Spatial Motion System (§5)
 * Single source of truth for physical damped springs and interruptible transitions.
 */
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

export const spring = {
  type: 'spring',
  stiffness: 380,
  damping: 28,
  mass: 0.8,
} as const;

export const springSoft = {
  type: 'spring',
  stiffness: 220,
  damping: 30,
  mass: 1.0,
} as const;

export const springSnappy = {
  type: 'spring',
  stiffness: 520,
  damping: 34,
  mass: 0.7,
} as const;

export const springScrubber = {
  type: 'spring',
  stiffness: 450,
  damping: 25,
  mass: 0.5,
} as const;

export const fadeTransition = {
  duration: 0.12,
  ease: [0.16, 1, 0.3, 1],
} as const;

/**
 * Universal hook ensuring strict reduced motion compliance across visionOS/Spatial UI.
 * Under reduced motion: springs are replaced by 120ms opacity fades; tilt, ambilight, and magnification are disabled.
 */
export function useSpatialMotion() {
  const isReduced = useFramerReducedMotion();

  return {
    isReduced: !!isReduced,
    spring: isReduced ? fadeTransition : spring,
    springSoft: isReduced ? fadeTransition : springSoft,
    springSnappy: isReduced ? fadeTransition : springSnappy,
    springScrubber: isReduced ? fadeTransition : springScrubber,
  };
}
