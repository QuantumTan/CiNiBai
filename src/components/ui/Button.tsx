import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'ghost' | 'outline' | 'glass' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-accent text-on-accent hover:bg-accent-light active:bg-accent-dark active:scale-[0.98] shadow-md border-transparent',
  gold: 'bg-accent text-on-accent hover:bg-accent-light active:bg-accent-dark active:scale-[0.98] shadow-md border-transparent',
  ghost: 'bg-white/5 border border-border-default text-text-primary hover:bg-white/10 hover:border-border-strong active:scale-[0.98]',
  outline: 'bg-white/5 border border-border-default text-text-primary hover:bg-white/10 hover:border-border-strong active:scale-[0.98]',
  glass: 'apple-glass-regular text-text-primary hover:text-accent-light hover:border-border-strong active:scale-[0.98]',
  icon: 'h-11 w-11 p-0 rounded-full bg-black/60 border border-border-default text-text-primary hover:bg-black/80 hover:border-border-strong active:scale-[0.98] justify-center',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-xs min-h-[44px] rounded-md font-semibold',
  md: 'px-5 py-3 text-sm min-h-[44px] rounded-md font-semibold',
  lg: 'px-6 py-3.5 text-base min-h-[48px] rounded-md font-semibold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    className,
    children,
    ...props
  },
  ref
) {
  const isIconButton = variant === 'icon';

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 cursor-pointer select-none transition-colors duration-150 ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        variantStyles[variant],
        !isIconButton && sizeStyles[size],
        props.disabled && 'opacity-50 cursor-not-allowed active:scale-100 pointer-events-none',
        className
      )}
      aria-disabled={props.disabled}
      {...props}
    >
      {children}
    </button>
  );
});
