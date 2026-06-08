import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'default' | 'muted' | 'success' | 'blue';
};

const tones = {
  default: 'bg-primary/12 text-primary ring-primary/25',
  muted: 'bg-muted text-muted-foreground ring-border',
  success: 'bg-success/12 text-success ring-success/25',
  blue: 'bg-secondary/12 text-secondary ring-secondary/25',
};

export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center rounded-md px-2.5 text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
