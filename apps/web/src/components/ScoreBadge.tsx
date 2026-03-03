interface ScoreBadgeProps {
  score: number;
}

export default function ScoreBadge({ score }: ScoreBadgeProps) {
  const pct = Math.round(score * 100);

  let color: string;
  if (pct >= 80) color = "bg-green-100 text-green-800";
  else if (pct >= 60) color = "bg-yellow-100 text-yellow-800";
  else if (pct >= 40) color = "bg-orange-100 text-orange-800";
  else color = "bg-red-100 text-red-800";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${color}`}
    >
      {pct}%
    </span>
  );
}
