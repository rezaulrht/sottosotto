/**
 * Opening hours logic (ARCHITECTURE §5.2). Pure functions, no date library.
 * All "today" decisions are made in the Europe/London time zone, so BST/GMT
 * changes and visitors in other time zones are handled by Intl.
 */

export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export interface Session {
  open: string; // HH:MM
  close: string; // HH:MM
}

export interface Closure {
  label: string;
  from: string; // MM-DD
  to: string; // MM-DD, may be before `from` when the range wraps over New Year
}

export interface HoursData {
  timezone: string;
  weekly: Record<Weekday, Session[]>;
  closures: Closure[];
}

export interface LondonMoment {
  year: number;
  month: number; // 1-12
  day: number;
  weekday: Weekday;
  minutes: number; // minutes since local midnight
}

const pad = (n: number) => String(n).padStart(2, '0');

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  return h * 60 + m;
}

/** The given instant as a local date and time in `timeZone`. */
export function localMoment(date: Date, timeZone = 'Europe/London'): LondonMoment {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    weekday: get('weekday').toLowerCase() as Weekday,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

export function monthDay(m: Pick<LondonMoment, 'month' | 'day'>): string {
  return `${pad(m.month)}-${pad(m.day)}`;
}

export function closureFor(md: string, closures: Closure[]): Closure | undefined {
  return closures.find((c) =>
    c.from <= c.to ? md >= c.from && md <= c.to : md >= c.from || md <= c.to,
  );
}

/** A calendar date `offset` days after the given local date, with its weekday. */
function addDays(
  m: LondonMoment,
  offset: number,
): Pick<LondonMoment, 'year' | 'month' | 'day' | 'weekday'> {
  // Noon UTC falls on the same calendar date in London all year round.
  const d = new Date(Date.UTC(m.year, m.month - 1, m.day + offset, 12));
  const weekday = WEEKDAYS[(d.getUTCDay() + 6) % 7] as Weekday;
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(), weekday };
}

export interface Reopen {
  weekday: Weekday;
  month: number;
  day: number;
  daysAway: number;
}

export type HoursStatus =
  | { kind: 'open-today'; sessions: Session[] }
  | { kind: 'closed-today' | 'closed-now'; closure?: Closure; reopen: Reopen | null };

/**
 * Today's status. "closed-now" = an opening day whose last session has ended.
 * Wording of that state and of closures is pending (OPEN_QUESTIONS Q13, Q14).
 */
export function hoursStatus(date: Date, hours: HoursData, lookAheadDays = 31): HoursStatus {
  const now = localMoment(date, hours.timezone);
  const todayClosure = closureFor(monthDay(now), hours.closures);
  const sessions = hours.weekly[now.weekday];
  const lastClose = sessions.length ? Math.max(...sessions.map((s) => toMinutes(s.close))) : -1;

  if (!todayClosure && sessions.length && now.minutes < lastClose) {
    return { kind: 'open-today', sessions };
  }

  let reopen: Reopen | null = null;
  for (let i = 1; i <= lookAheadDays; i++) {
    const d = addDays(now, i);
    if (hours.weekly[d.weekday].length && !closureFor(monthDay(d), hours.closures)) {
      reopen = { weekday: d.weekday, month: d.month, day: d.day, daysAway: i };
      break;
    }
  }

  const closedToday = !!todayClosure || sessions.length === 0;
  return {
    kind: closedToday ? 'closed-today' : 'closed-now',
    ...(todayClosure ? { closure: todayClosure } : {}),
    reopen,
  };
}

/** "12:00" → "12", "14:00" → "2", "14:30" → "2:30" (12-hour, no am/pm, as in PAGES.md). */
export function shortTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${pad(m)}` : String(h12);
}

/** "12–2 & 5–10" */
export function formatSessions(sessions: Session[]): string {
  return sessions.map((s) => `${shortTime(s.open)}–${shortTime(s.close)}`).join(' & ');
}

const SHORT: Record<Weekday, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Weekly summary lines, grouping consecutive days with identical sessions:
 * [{ days: "Tue–Sat", sessions: "12–2 & 5–10" }, { days: "Sun–Mon", sessions: null }]
 */
export function weeklySummary(
  weekly: HoursData['weekly'],
): Array<{ days: string; sessions: string | null }> {
  const groups: Array<{ start: Weekday; end: Weekday; key: string }> = [];
  for (const day of WEEKDAYS) {
    const key = formatSessions(weekly[day]);
    const last = groups.at(-1);
    if (last && last.key === key) last.end = day;
    else groups.push({ start: day, end: day, key });
  }
  // Join a closed Sunday with a closed Monday (week wraps).
  if (groups.length > 1 && groups[0]!.key === groups.at(-1)!.key && groups[0]!.key === '') {
    const first = groups.shift()!;
    groups.at(-1)!.end = first.end;
  }
  return groups.map((g) => ({
    days: g.start === g.end ? SHORT[g.start] : `${SHORT[g.start]}–${SHORT[g.end]}`,
    sessions: g.key || null,
  }));
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Chip text for a status (PAGES.md, Home hero). */
export function statusText(status: HoursStatus): string {
  if (status.kind === 'open-today') return `Open today · ${formatSessions(status.sessions)}`;
  const lead = status.kind === 'closed-now' ? 'Closed now' : 'Closed today';
  if (!status.reopen) return lead;
  const r = status.reopen;
  const when =
    r.daysAway <= 6
      ? capitalise(r.weekday)
      : `${capitalise(r.weekday)} ${r.day} ${MONTHS[r.month - 1]}`;
  return `${lead}, we reopen ${when}`;
}
