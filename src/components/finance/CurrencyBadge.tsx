"use client";

const CURRENCY_COLORS: Record<string, string> = {
  AED: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
  INR: "bg-orange-900/60 text-orange-300 border-orange-700",
  USD: "bg-blue-900/60 text-blue-300 border-blue-700",
  EUR: "bg-indigo-900/60 text-indigo-300 border-indigo-700",
  GBP: "bg-violet-900/60 text-violet-300 border-violet-700",
};

const CURRENCY_FLAGS: Record<string, string> = {
  AED: "🇦🇪",
  INR: "🇮🇳",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
};

interface CurrencyBadgeProps {
  currency: string;
  showFlag?: boolean;
  size?: "sm" | "md";
}

export default function CurrencyBadge({
  currency,
  showFlag = true,
  size = "sm",
}: CurrencyBadgeProps) {
  const colorClass =
    CURRENCY_COLORS[currency] ??
    "bg-gray-800 text-gray-300 border-gray-600";
  const flag = showFlag ? (CURRENCY_FLAGS[currency] ?? "") : "";
  const sizeClass =
    size === "sm"
      ? "px-1.5 py-0.5 text-[10px] font-semibold"
      : "px-2 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded border ${colorClass} ${sizeClass} tracking-wide`}>
      {flag && <span>{flag}</span>}
      {currency}
    </span>
  );
}
