// Number / currency formatting helpers.
//
// Big metric values are shown abbreviated (1.2K, 3.4M, 1.1B) for compactness;
// the exact figure is exposed separately (e.g. in a tooltip). See <MetricValue>.

const ABBREV = [
  { v: 1e12, s: "T" },
  { v: 1e9, s: "B" },
  { v: 1e6, s: "M" },
  { v: 1e3, s: "K" },
];

// Drop trailing zeros from a fixed-decimal string: "1.20" -> "1.2", "3.00" -> "3".
const trimZeros = (s: string) => s.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");

/** "1234567" -> "1.2M". Values below 1000 are returned with up to `decimals` dp. */
export function abbreviateNumber(value: number, decimals = 1): string {
  if (value == null || Number.isNaN(value)) return "0";
  const sign = value < 0 ? "-" : "";
  const n = Math.abs(value);
  for (const { v, s } of ABBREV) {
    if (n >= v) return sign + trimZeros((n / v).toFixed(decimals)) + s;
  }
  // < 1000: integers stay integers, otherwise trim to `decimals` dp.
  return sign + trimZeros((Number.isInteger(n) ? n : Number(n.toFixed(decimals))).toString());
}

/** Full value with thousands separators: 1234567 -> "1,234,567". */
export function formatExactNumber(value: number): string {
  if (value == null || Number.isNaN(value)) return "0";
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/** "$1.2M" (compact). Small values keep 2 dp: "$12.34". */
export function abbreviateCurrency(value: number, decimals = 1): string {
  if (value == null || Number.isNaN(value)) return "$0";
  const sign = value < 0 ? "-" : "";
  const n = Math.abs(value);
  for (const { v, s } of ABBREV) {
    if (n >= v) return `${sign}$${trimZeros((n / v).toFixed(decimals))}${s}`;
  }
  return `${sign}$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

/** Exact currency: 1234567.5 -> "$1,234,567.50". */
export function formatExactCurrency(value: number): string {
  if (value == null || Number.isNaN(value)) return "$0.00";
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Percent with 2 dp: 12.3456 -> "12.35%". */
export function formatPercent(value: number): string {
  if (value == null || Number.isNaN(value)) return "0%";
  return `${value.toFixed(2)}%`;
}

/** True when the compact form actually hides precision (so a tooltip is useful). */
export function isAbbreviated(value: number): boolean {
  return Math.abs(value || 0) >= 1000;
}
