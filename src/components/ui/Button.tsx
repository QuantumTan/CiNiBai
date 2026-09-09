import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantStyles = {
  gold: 'bg-gold text-black font-semibold hover:bg-gold-light active:bg-gold-dark',
  outline: 'border border-white/20 text-text-primary hover:bg-white/10',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/5',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-lg',
  lg: 'px-8 py-3 text-base rounded-xl',
};

export function Button({ variant = 'gold', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        variantStyles[variant],
        sizeStyles[size],
        props.disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
