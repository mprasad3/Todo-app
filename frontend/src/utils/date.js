const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Returns local calendar date as YYYY-MM-DD.
 */
export function getTodayDateStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parses YYYY-MM-DD as a UTC Date object at midnight.
 */
export function parseDateStrUtc(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Formats a UTC Date object to YYYY-MM-DD.
 */
export function formatDateStrUtc(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Converts YYYY-MM-DD to ISO UTC midnight string for backend dueAt.
 */
export function toUtcMidnightIso(dateStr) {
  return `${dateStr}T00:00:00.000Z`;
}

/**
 * Combines YYYY-MM-DD and HH:mm into a UTC ISO string, or returns null.
 */
export function combineDateAndTimeIso(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  return `${dateStr}T${timeStr}:00.000Z`;
}

/**
 * Extracts YYYY-MM-DD from an ISO timestamp string.
 */
export function extractDateStr(isoString) {
  if (!isoString) return getTodayDateStr();
  return isoString.slice(0, 10);
}

/**
 * Extracts HH:mm from an ISO timestamp string.
 */
export function extractTimeStr(isoString) {
  if (!isoString) return '';
  return isoString.slice(11, 16);
}

/**
 * Formats YYYY-MM-DD to Figma style: e.g., "Friday 14, January"
 */
export function formatFigmaDate(dateStr) {
  if (!dateStr) return '';
  const d = parseDateStrUtc(dateStr);
  const weekday = WEEKDAY_LONG[d.getUTCDay()];
  const day = d.getUTCDate();
  const month = MONTH_LONG[d.getUTCMonth()];
  return `${weekday} ${day}, ${month}`;
}

/**
 * Formats an ISO timestamp's time portion cleanly, e.g., "09:00 AM"
 */
export function formatDisplayTime(isoString) {
  if (!isoString) return '';
  const hhmm = extractTimeStr(isoString);
  const [hStr, mStr] = hhmm.split(':');
  const hour = Number(hStr);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(hour12).padStart(2, '0')}:${mStr} ${suffix}`;
}

/**
 * Builds the Monday-to-Sunday 7-day strip for the week containing `anchorDateStr`.
 */
export function getWeekDays(anchorDateStr) {
  const todayStr = getTodayDateStr();
  const anchor = parseDateStrUtc(anchorDateStr);
  const dayOfWeek = anchor.getUTCDay() || 7; // Mon=1 ... Sun=7
  const monday = new Date(anchor);
  monday.setUTCDate(anchor.getUTCDate() - dayOfWeek + 1);

  return Array.from({ length: 7 }, (_, idx) => {
    const current = new Date(monday);
    current.setUTCDate(monday.getUTCDate() + idx);
    const dateStr = formatDateStrUtc(current);
    return {
      dateStr,
      dayShort: WEEKDAY_SHORT[current.getUTCDay()],
      dayNumber: String(current.getUTCDate()).padStart(2, '0'),
      isToday: dateStr === todayStr,
    };
  });
}

/**
 * Shifts a YYYY-MM-DD string by `deltaDays`.
 */
export function shiftDateStr(dateStr, deltaDays) {
  const date = parseDateStrUtc(dateStr);
  date.setUTCDate(date.getUTCDate() + deltaDays);
  return formatDateStrUtc(date);
}

/**
 * Formats a concise Monday-Sunday week range label, e.g., "Nov 09 – Nov 15"
 */
export function formatWeekRangeLabel(anchorDateStr) {
  const days = getWeekDays(anchorDateStr);
  const first = parseDateStrUtc(days[0].dateStr);
  const last = parseDateStrUtc(days[6].dateStr);
  const startMonth = MONTH_SHORT[first.getUTCMonth()];
  const endMonth = MONTH_SHORT[last.getUTCMonth()];
  const startDay = String(first.getUTCDate()).padStart(2, '0');
  const endDay = String(last.getUTCDate()).padStart(2, '0');
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
}

/**
 * Formats a two-digit number for the summary cards (e.g., 8 -> "08", 50 -> "50").
 */
export function formatTwoDigits(count) {
  return String(Math.max(0, Number(count) || 0)).padStart(2, '0');
}
