import { IconLoader2 } from '@tabler/icons-react';

type SpinnerSize = 'sm' | 'md' | 'lg';

type Props = {
  size?: SpinnerSize;
  color?: string;
  className?: string;
};

const sizeMap: Record<SpinnerSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
};

export default function Spinner({ size = 'md', color, className = '' }: Props) {
  return (
    <IconLoader2
      className={`animate-spin ${className}`}
      style={{ width: sizeMap[size], height: sizeMap[size], color, flexShrink: 0 }}
    />
  );
}
