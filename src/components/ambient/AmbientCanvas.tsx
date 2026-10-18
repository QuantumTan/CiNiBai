import { motion } from 'framer-motion';
import { useAmbientStore } from '../../stores/ambient';
import { springSoft, useSpatialMotion } from '../../lib/motion';

export function AmbientCanvas() {
  const { colors, ambilightEnabled } = useAmbientStore();
  const { isReduced } = useSpatialMotion();

  const c0 = colors[0] || { r: 35, g: 25, b: 18 };
  const c1 = colors[1] || { r: 18, g: 22, b: 35 };
  const c2 = colors[2] || { r: 24, g: 15, b: 26 };

  if (!ambilightEnabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-bg-base"
    >
      {/* Primary Atmospheric Blob (Top Stage Focus) */}
      <motion.div
        animate={
          isReduced
            ? undefined
            : {
                background: `radial-gradient(ellipse 90% 70% at 50% 10%, rgba(${c0.r}, ${c0.g}, ${c0.b}, 0.28) 0%, rgba(${c0.r}, ${c0.g}, ${c0.b}, 0.05) 55%, transparent 75%)`,
              }
        }
        style={
          isReduced
            ? {
                background: `radial-gradient(ellipse 90% 70% at 50% 10%, rgba(${c0.r}, ${c0.g}, ${c0.b}, 0.2) 0%, transparent 70%)`,
              }
            : undefined
        }
        transition={isReduced ? undefined : springSoft}
        className="absolute -top-[10%] left-1/2 h-[45vh] md:h-[750px] w-[95vw] md:w-[1400px] -translate-x-1/2 rounded-full blur-[100px] md:blur-[140px] will-change-transform"
      />

      {/* Secondary Chromatic Blob (Right Perimeter Fill) */}
      <motion.div
        animate={
          isReduced
            ? undefined
            : {
                background: `radial-gradient(circle at center, rgba(${c1.r}, ${c1.g}, ${c1.b}, 0.18) 0%, rgba(${c1.r}, ${c1.g}, ${c1.b}, 0.03) 50%, transparent 70%)`,
              }
        }
        style={
          isReduced
            ? {
                background: `radial-gradient(circle at center, rgba(${c1.r}, ${c1.g}, ${c1.b}, 0.12) 0%, transparent 60%)`,
              }
            : undefined
        }
        transition={isReduced ? undefined : springSoft}
        className="absolute top-[35%] right-[-10%] h-[35vh] md:h-[600px] w-[70vw] md:w-[700px] rounded-full blur-[110px] md:blur-[160px] will-change-transform"
      />

      {/* Tertiary Depth Blob (Lower Left Floor Resonance) */}
      <motion.div
        animate={
          isReduced
            ? undefined
            : {
                background: `radial-gradient(circle at center, rgba(${c2.r}, ${c2.g}, ${c2.b}, 0.14) 0%, transparent 65%)`,
              }
        }
        style={
          isReduced
            ? {
                background: `radial-gradient(circle at center, rgba(${c2.r}, ${c2.g}, ${c2.b}, 0.08) 0%, transparent 60%)`,
              }
            : undefined
        }
        transition={isReduced ? undefined : springSoft}
        className="absolute top-[60%] left-[-10%] h-[30vh] md:h-[550px] w-[65vw] md:w-[650px] rounded-full blur-[100px] md:blur-[150px] will-change-transform"
      />

      {/* Obsidian Base Ground Pinning Scrim */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-base/30 to-bg-base pointer-events-none" />
    </div>
  );
}
