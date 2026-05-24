"use client";

interface ParsingConfidenceBadgeProps {
  score: number; // 0–1
  showPercent?: boolean;
}

export default function ParsingConfidenceBadge({
  score,
  showPercent = true,
}: ParsingConfidenceBadgeProps) {
  const pct = Math.round(score * 100);

  let dotClass = "";
  let textClass = "";
  let label = "";

  if (score >= 0.85) {
    dotClass = "bg-emerald-400";
    textClass = "text-emerald-400";
    label = "High";
  } else if (score >= 0.70) {
    dotClass = "bg-yellow-400";
    textClass = "text-yellow-400";
    label = "Medium";
  } else {
    dotClass = "bg-red-400";
    textClass = "text-red-400";
    label = "Low";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] ${textClass}`}
      title={`Confidence: ${pct}% (${label})`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {showPercent ? `${pct}%` : label}
    </span>
  );
}
