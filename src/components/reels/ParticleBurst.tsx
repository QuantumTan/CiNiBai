/**
 * Particle Burst Component (§6.2)
 * Monochrome/palette-tinted micro-burst (<= 12 particles) on Like interaction.
 * Utilizes GPU-accelerated transforms, auto-cleanup, and respects prefers-reduced-motion.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialMotion } from '../../lib/motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

interface ParticleBurstProps {
  active: boolean;
  color?: string; // Optional palette tint (defaults to pure white)
  onComplete?: () => void;
}

export function ParticleBurst({ active, color = 'rgba(255, 255, 255, 0.9)', onComplete }: ParticleBurstProps) {
  const { isReduced } = useSpatialMotion();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active || isReduced) {
      setParticles([]);
      return;
    }

    // Exactly 10 particles (§6.2: <= 12 particles, never multicolor)
    const count = 10;
    const generated: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const distance = 22 + Math.random() * 14;
      generated.push({
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 3 + Math.random() * 2.5,
        opacity: 0.85,
      });
    }

    setParticles(generated);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 450);

    return () => clearTimeout(timer);
  }, [active, isReduced, onComplete]);

  if (isReduced || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ scale: 0.2, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: 1,
              x: p.x,
              y: p.y,
              opacity: 0,
            }}
            transition={{
              duration: 0.42,
              ease: [0.16, 1, 0.3, 1], // Apple spring curve
            }}
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: color,
            }}
            className="absolute rounded-full"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
