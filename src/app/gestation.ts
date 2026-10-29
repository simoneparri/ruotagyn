export type Calculation = { ok: true; value: Gestation } | { ok: false; error: string };

export interface Gestation {
  elapsedDays: number;
  weeks: number;
  days: number;
  dueDate: string;
  progress: number;
}

const DAY_MS = 86_400_000;
const ESTIMATED_DURATION_DAYS = 280;

function parseCivilDate(iso: string): Date {
  if (typeof iso !== 'string' || iso.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    throw new RangeError('Inserisci una data nel formato YYYY-MM-DD.');
  }

  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    year < 1900 ||
    year > 9999 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError('Inserisci una data esistente con anno compreso tra 1900 e 9999.');
  }

  return date;
}

export function addDays(iso: string, days: number): string {
  const date = parseCivilDate(iso);
  if (!Number.isSafeInteger(days)) {
    throw new RangeError('Il numero di giorni deve essere un intero valido.');
  }

  date.setUTCDate(date.getUTCDate() + days);
  if (
    !Number.isFinite(date.getTime()) ||
    date.getUTCFullYear() < 1900 ||
    date.getUTCFullYear() > 9999
  ) {
    throw new RangeError('La data risultante deve avere un anno compreso tra 1900 e 9999.');
  }

  return date.toISOString().slice(0, 10);
}

/** La data presunta è una stima convenzionale di 280 giorni dall'ultima mestruazione. */
export function calculateGestation(lmp: string, reference: string): Calculation {
  try {
    const start = parseCivilDate(lmp);
    const end = parseCivilDate(reference);
    const elapsedDays = (end.getTime() - start.getTime()) / DAY_MS;
    if (elapsedDays < 0) {
      return {
        ok: false,
        error: "La data dell'ultima mestruazione non può essere successiva alla data di riferimento.",
      };
    }

    return {
      ok: true,
      value: {
        elapsedDays,
        weeks: Math.floor(elapsedDays / 7),
        days: elapsedDays % 7,
        dueDate: addDays(lmp, ESTIMATED_DURATION_DAYS),
        progress: Math.min(100, Math.max(0, (elapsedDays / ESTIMATED_DURATION_DAYS) * 100)),
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Impossibile calcolare le date.',
    };
  }
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseCivilDate(iso));
}

export function todayIso(): string {
  const today = new Date();
  const year = String(today.getFullYear()).padStart(4, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
