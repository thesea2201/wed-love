interface CharCounterProps {
  current: number;
  max: number;
  warnAt?: number;
}

export default function CharCounter({ current, max, warnAt = 0.9 }: CharCounterProps) {
  const over = current > max;
  const warn = !over && current >= Math.floor(max * warnAt);
  const colorClass = over
    ? 'text-red-500'
    : warn
      ? 'text-amber-500'
      : 'text-gray-400';

  return (
    <span
      data-testid="char-counter"
      data-over={over ? 'true' : 'false'}
      data-warn={warn ? 'true' : 'false'}
      className={`text-xs ${colorClass} tabular-nums`}
    >
      {current}/{max}
    </span>
  );
}
