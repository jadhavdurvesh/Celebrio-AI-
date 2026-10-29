export function money(value, currency = "INR") {
  try { return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value) || 0); }
  catch { return `${currency} ${(Number(value) || 0).toLocaleString("en-IN")}`; }
}
export function shortDate(value) {
  if (!value) return "Date not set";
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}