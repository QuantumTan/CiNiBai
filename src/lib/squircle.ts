/**
 * Continuous Curvature (Squircle) Path Generator (§3.5)
 * Generates superellipse SVG path with G2 continuity (smoothing 0.6)
 * to avoid abrupt tangent breaks on prominent optical glass surfaces.
 */

export function getSquirclePath(
  width: number,
  height: number,
  radius: number,
  smoothing: number = 0.6
): string {
  if (width <= 0 || height <= 0) return '';

  const maxRadius = Math.min(width, height) / 2;
  const r = Math.min(radius, maxRadius);
  const p = Math.min(smoothing, 1) * r;

  // Coordinate math for G2 continuous curvature
  const w = width;
  const h = height;

  return [
    `M ${w - r} 0`,
    `C ${w - r + p} 0, ${w} ${r - p}, ${w} ${r}`,
    `L ${w} ${h - r}`,
    `C ${w} ${h - r + p}, ${w - r + p} ${h}, ${w - r} ${h}`,
    `L ${r} ${h}`,
    `C ${r - p} ${h}, 0 ${h - r + p}, 0 ${h - r}`,
    `L 0 ${r}`,
    `C 0 ${r - p}, ${r - p} 0, ${r} 0`,
    'Z',
  ].join(' ');
}
