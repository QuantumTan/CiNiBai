import { motion } from 'framer-motion';
import { useAmbientStore } from '../../stores/ambient';
import { springSoft } from '../../lib/motion';

export function AmbientCanvas() {
  const { colors, ambilightEnabled } = useAmbientStore();

  const c0 = colors[0] || { r: 35, g: 25, b: 18 };
  const c1 = colors[1] || { r: 18, g: 22, b: 35 };
  const c2 = colors[2] || { r: 24, g: 15, b: 26 };

  if (!ambilightEnabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none bg-[#060709]"
    >
      {/* Primary Atmospheric Blob (Top Stage Focus) */}
      <motion.div
        animate={{
          background: `radial-gradient(ellipse 90% 70% at 50% 10%, rgba(${c0.r}, ${c0.g}, ${c0.b}, 0.28) 0%, rgba(${c0.r}, ${c0.g}, ${c0.b}, 0.05) 55%, transparent 75%)`,
        }}
        transition={springSoft}
        className="absolute -top-[15%] left-1/2 h-[750px] w-[1400px] -translate-x-1/2 rounded-full blur-[140px] will-change-transform"
      />

      {/* Secondary Chromatic Blob (Right Perimeter Fill) */}
      <motion.div
        animate={{
          background: `radial-gradient(circle at center, rgba(${c1.r}, ${c1.g}, ${c1.b}, 0.18) 0%, rgba(${c1.r}, ${c1.g}, ${c1.b}, 0.03) 50%, transparent 70%)`,
        }}
        transition={springSoft}
        className="absolute top-[35%] right-[-10%] h-[600px] w-[700px] rounded-full blur-[160px] will-change-transform"
      />

      {/* Tertiary Depth Blob (Lower Left Floor Resonance) */}
      <motion.div
        animate={{
          background: `radial-gradient(circle at center, rgba(${c2.r}, ${c2.g}, ${c2.b}, 0.14) 0%, transparent 65%)`,
        }}
        transition={springSoft}
        className="absolute top-[60%] left-[-10%] h-[550px] w-[650px] rounded-full blur-[150px] will-change-transform"
      />

      {/* Obsidian Base Ground Pinning Scrim */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#060709]/30 to-[#060709] pointer-events-none" />
    </div>
  );
}
