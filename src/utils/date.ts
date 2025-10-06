export function toISOFromLocal(datetimeLocalValue: string): string {
  if (!datetimeLocalValue) return "";
  // Expecting format YYYY-MM-DDTHH:mm or HH:mm:ss; ensure seconds
  const hasSeconds = datetimeLocalValue.length > 16;
  const normalized = hasSeconds
    ? datetimeLocalValue
    : `${datetimeLocalValue}:00`;
  // Return without timezone suffix per requirement
  return normalized;
}

export function formatDate(dateISO: string): string {
  if (!dateISO) return "";
  const [y, m, d] = dateISO.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

export function formatDateTime(dateISO: string): string {
  if (!dateISO) return "";
  const [date, time] = dateISO.split("T");
  const [y, m, d] = date.split("-");
  const [hh, mm] = time.split(":");
  return `${d}/${m}/${y} ${hh}:${mm}`;
}
