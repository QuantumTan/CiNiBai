import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantStyles = {
  gold: 'bg-amber-400 text-black font-semibold hover:bg-amber-300 active:bg-amber-500 shadow-md',
  glass: 'apple-glass-regular text-white hover:text-amber-300 hover:border-amber-400/40 shadow-sm',
  outline: 'apple-glass-thin text-slate-200 hover:text-white hover:border-white/30',
  ghost: 'text-slate-300 hover:text-white hover:bg-white/10',
};

const sizeStyles = {
  sm: 'px-3.5 py-1.5 text-xs rounded-full',
  md: 'px-5 py-2.5 text-sm rounded-full',
  lg: 'px-8 py-3.5 text-base rounded-full font-semibold',
};

export function Button({ variant = 'gold', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-200 active:scale-[0.96] select-none outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80',
        variantStyles[variant],
        sizeStyles[size],
        props.disabled && 'cursor-not-allowed opacity-50 active:scale-100',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
