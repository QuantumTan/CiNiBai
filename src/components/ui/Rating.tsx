import { Star } from 'lucide-react';
import { formatRating } from '../../lib/utils';
import { cn } from '../../lib/utils';

export interface RatingProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 12, text: 'text-xs' },
  md: { icon: 14, text: 'text-sm' },
  lg: { icon: 16, text: 'text-base' },
};

export function Rating({ value, size = 'md', showLabel = false, className }: RatingProps) {
  const { icon, text } = sizeMap[size];
  const formatted = formatRating(value);

  return (
    <div
      role="img"
      aria-label={`Rated ${formatted} out of 10`}
      className={cn('inline-flex items-center gap-1 font-semibold text-accent-light', className)}
    >
      <Star size={icon} className="fill-accent text-accent" aria-hidden="true" />
      <span className={cn(text, 'text-text-primary')}>{formatted}</span>
      {showLabel && (
        <span className={cn(text, 'text-text-muted')}>/10</span>
      )}
    </div>
  );
}
