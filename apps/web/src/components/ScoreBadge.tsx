interface ScoreBadgeProps {
  score: number;
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  const pct = Math.round(score * 100);

  let bgColor: string;
  let textColor: string;
  let glowColor: string;

  if (pct >= 80) {
    bgColor = "bg-emerald-accent/15";
    textColor = "text-emerald-accent";
    glowColor = "shadow-[0_0_8px_rgba(52,211,153,0.2)]";
  } else if (pct >= 60) {
    bgColor = "bg-amber-accent/15";
    textColor = "text-amber-accent";
    glowColor = "shadow-[0_0_8px_rgba(245,166,35,0.2)]";
  } else if (pct >= 40) {
    bgColor = "bg-orange-400/15";
    textColor = "text-orange-400";
    glowColor = "shadow-[0_0_8px_rgba(251,146,60,0.2)]";
  } else {
    bgColor = "bg-rose-accent/15";
    textColor = "text-rose-accent";
    glowColor = "shadow-[0_0_8px_rgba(251,113,133,0.2)]";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-sm font-semibold ${bgColor} ${textColor} ${glowColor}`}
    >
      {pct}%
    </span>
  );
}
