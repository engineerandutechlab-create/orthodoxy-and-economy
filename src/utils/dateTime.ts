import { Language } from '../types';

const LOCALE_MAP: Record<Language, string> = {
  am: 'am-ET',
  en: 'en-US',
  om: 'om-ET',
  ti: 'ti-ET',
};

/**
 * Safely converts any Firestore / JS / numeric timestamp representation into epoch milliseconds.
 * Returns 0 when the value is missing or invalid.
 */
export function getTimestampMs(value?: unknown): number {
  if (value === null || value === undefined || value === '') return 0;

  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : 0;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) return 0;
    // Heuristic: < 1e12 means epoch seconds, >= 1e12 means epoch milliseconds
    return value < 1_000_000_000_000 ? Math.round(value * 1000) : Math.round(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    if (/^\d{10,13}$/.test(trimmed)) {
      return getTimestampMs(Number(trimmed));
    }
    const parsed = Date.parse(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, any>;
    if (typeof obj.toDate === 'function') {
      try {
        const d = obj.toDate();
        if (d instanceof Date && Number.isFinite(d.getTime())) {
          return d.getTime();
        }
      } catch {
        // ignore and continue checking fields
      }
    }

    const rawSeconds =
      typeof obj.seconds === 'number'
        ? obj.seconds
        : typeof obj._seconds === 'number'
        ? obj._seconds
        : undefined;

    if (rawSeconds !== undefined && Number.isFinite(rawSeconds)) {
      const rawNanos =
        typeof obj.nanoseconds === 'number'
          ? obj.nanoseconds
          : typeof obj._nanoseconds === 'number'
          ? obj._nanoseconds
          : 0;
      return Math.round(rawSeconds * 1000 + rawNanos / 1_000_000);
    }

    if (typeof obj.milliseconds === 'number') {
      return getTimestampMs(obj.milliseconds);
    }
  }

  return 0;
}

/**
 * Extracts a creation epoch timestamp embedded in document IDs like
 * "job_1763310200123", "prod_1763310200123", or "serv_1763310200123".
 */
export function extractTimestampFromId(docId?: string | null): string {
  if (!docId || typeof docId !== 'string') return '';
  const match = docId.match(/(?:^|_)(1[5-9]\d{11})(?:_|$)/);
  if (!match) return '';
  const ms = Number(match[1]);
  if (!Number.isFinite(ms)) return '';
  const d = new Date(ms);
  const year = d.getUTCFullYear();
  if (year < 2020 || year > 2100) return '';
  return d.toISOString();
}

/**
 * Parses a Firestore / serialized timestamp into an ISO-8601 string without fabricating
 * "current time" for historical documents that lack a timestamp.
 */
export function parseFirestoreTimestamp(
  val: unknown,
  fallbackId?: string,
  secondaryVal?: unknown
): string {
  const primaryMs = getTimestampMs(val);
  if (primaryMs > 0) {
    return new Date(primaryMs).toISOString();
  }

  const fromId = extractTimestampFromId(fallbackId);
  if (fromId) {
    return fromId;
  }

  const secondaryMs = getTimestampMs(secondaryVal);
  if (secondaryMs > 0) {
    return new Date(secondaryMs).toISOString();
  }

  return '';
}

export interface FormattedExactDateTime {
  dateText: string;
  timeText: string;
  fullText: string;
  isoText: string;
  ms: number;
}

/**
 * Formats an exact posted date, hour, and minute in the user's local timezone.
 * Returns null if the timestamp is absent or invalid.
 */
export function formatExactPostedDateTime(
  value?: unknown,
  language: Language = 'am'
): FormattedExactDateTime | null {
  const ms = getTimestampMs(value);
  if (ms <= 0) return null;

  const dateObj = new Date(ms);
  const locale = LOCALE_MAP[language] || 'am-ET';

  let dateText = '';
  let timeText = '';

  try {
    dateText = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(dateObj);

    timeText = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj);
  } catch {
    dateText = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(dateObj);
    timeText = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj);
  }

  return {
    dateText,
    timeText,
    fullText: `${dateText} · ${timeText}`,
    isoText: dateObj.toISOString(),
    ms,
  };
}
