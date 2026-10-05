/**
 * Optical Edge Displacement Refraction Filter (§3.6)
 * Generates physical edge light refraction simulating glass lens curvature.
 * Embedded once in the application root DOM.
 */
export function RefractionFilter() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -left-[9999px] -top-[9999px] h-0 w-0 opacity-0"
    >
      <defs>
        <filter id="apple-glass-refraction" x="-20%" y="-20%" width="140%" height="140%">
          {/* Subtle high-frequency turbulence */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves="2"
            result="noise"
          />
          {/* Edge displacement vector */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="4"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          {/* Softened perimeter blending */}
          <feGaussianBlur in="displaced" stdDeviation="0.4" result="blurred" />
          <feMerge>
            <feMergeNode in="blurred" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
