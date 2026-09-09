import { Star } from 'lucide-react';
import { formatRating } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface RatingProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 12, text: 'text-xs' },
  md: { icon: 14, text: 'text-sm' },
  lg: { icon: 18, text: 'text-base' },
};

export function Rating({ value, size = 'md', showLabel = true, className }: RatingProps) {
  const { icon, text } = sizeMap[size];
  const color = value >= 7 ? 'text-green-400' : value >= 5 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Star size={icon} className="fill-gold text-gold" />
      <span className={cn(text, 'font-semibold', color)}>
        {formatRating(value)}
      </span>
      {showLabel && (
        <span className={cn(text, 'text-text-muted')}>/10</span>
      )}
    </div>
  );
}
