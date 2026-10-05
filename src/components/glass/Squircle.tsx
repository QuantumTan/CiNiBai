import React, { useRef, useState, useEffect } from 'react';
import { getSquirclePath } from '../../lib/squircle';
import { getCapabilities } from '../../lib/capabilities';

interface SquircleProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: number;
  smoothing?: number;
  as?: React.ElementType;
  children?: React.ReactNode;
}

export function Squircle({
  radius = 28,
  smoothing = 0.6,
  as: Component = 'div',
  className = '',
  style = {},
  children,
  ...props
}: SquircleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [clipPath, setClipPath] = useState<string>('');
  const caps = getCapabilities();

  useEffect(() => {
    // If native corner-shape is supported, rely on CSS directly
    if (caps.supportsCornerShape) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          const path = getSquirclePath(width, height, radius, smoothing);
          setClipPath(`path('${path}')`);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [radius, smoothing, caps.supportsCornerShape]);

  const squircleStyle: React.CSSProperties = {
    ...style,
    ...(caps.supportsCornerShape
      ? {
          borderRadius: `${radius}px`,
          // @ts-ignore -- Experimental CSS property
          cornerShape: 'squircle',
        }
      : clipPath
      ? {
          clipPath,
        }
      : {
          borderRadius: `${radius}px`,
        }),
  };

  return (
    <Component
      ref={containerRef}
      className={`relative ${className}`}
      style={squircleStyle}
      {...props}
    >
      {children}
    </Component>
  );
}
