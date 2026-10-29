import { afterEach, describe, expect, it, vi } from 'vitest';
import { addDays, calculateGestation, formatDate, todayIso } from './gestation';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('calculateGestation', () => {
  it.each([
    ['2024-01-01', 0, 0, 0],
    ['2024-01-07', 6, 0, 6],
    ['2024-01-08', 7, 1, 0],
    ['2024-10-07', 280, 40, 0],
    ['2024-10-21', 294, 42, 0],
  ])('calcola il riferimento %s senza limitare le settimane', (reference, elapsedDays, weeks, days) => {
    const result = calculateGestation('2024-01-01', reference);
    expect(result).toEqual({
      ok: true,
      value: {
        elapsedDays,
        weeks,
        days,
        dueDate: '2024-10-07',
        progress: Math.min(100, (elapsedDays / 280) * 100),
      },
    });
  });

  it.each([
    ['2024-02-28', '2024-03-01', 2],
    ['2023-02-28', '2023-03-01', 1],
    ['2024-04-30', '2024-05-01', 1],
    ['2023-12-31', '2024-01-01', 1],
    ['2024-03-30', '2024-04-01', 2],
    ['2024-10-26', '2024-10-28', 2],
    ['2024-03-09', '2024-03-11', 2],
    ['2024-11-02', '2024-11-04', 2],
  ])('conta i giorni civili da %s a %s', (lmp, reference, elapsedDays) => {
    const result = calculateGestation(lmp, reference);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.elapsedDays).toBe(elapsedDays);
      expect(result.value.weeks).toBe(0);
      expect(result.value.days).toBe(elapsedDays);
    }
  });

  it('rifiuta una data iniziale futura con un errore esplicito', () => {
    const result = calculateGestation('2024-01-02', '2024-01-01');
    expect(result).toEqual({ ok: false, error: expect.stringContaining('successiva') });
  });

  it('restituisce un errore esplicito se la data presunta supera il limite supportato', () => {
    expect(calculateGestation('9999-12-31', '9999-12-31')).toEqual({
      ok: false,
      error: expect.any(String),
    });
  });
});

const invalidDates = [
  '',
  '2024-1-01',
  '2024-01-1',
  ' 2024-01-01',
  '2024-01-01 ',
  '2024-01-01\n',
  '01/01/2024',
  '2024-01-01T00:00:00Z',
  '2024-00-01',
  '2024-13-01',
  '2024-01-00',
  '2024-01-32',
  '2024-04-31',
  '2023-02-29',
  '1900-02-29',
  '2100-02-29',
  '1899-12-31',
  '0000-01-01',
  '10000-01-01',
];

describe('validazione delle date', () => {
  it.each(invalidDates)('rifiuta %j senza normalizzarla', (iso) => {
    expect(calculateGestation(iso, '2024-01-01')).toEqual({
      ok: false,
      error: expect.any(String),
    });
    expect(calculateGestation('1900-01-01', iso)).toEqual({
      ok: false,
      error: expect.any(String),
    });
    expect(() => addDays(iso, 0)).toThrow(RangeError);
    expect(() => formatDate(iso)).toThrow(RangeError);
  });
});

describe('addDays', () => {
  it.each([
    ['2024-02-28', 1, '2024-02-29'],
    ['2000-02-28', 1, '2000-02-29'],
    ['1900-02-28', 1, '1900-03-01'],
    ['2024-02-29', 1, '2024-03-01'],
    ['2023-02-28', 1, '2023-03-01'],
    ['2024-04-30', 1, '2024-05-01'],
    ['2023-12-31', 1, '2024-01-01'],
    ['2024-01-01', -1, '2023-12-31'],
    ['2024-03-01', -1, '2024-02-29'],
    ['2024-01-01', 280, '2024-10-07'],
    ['1900-01-01', 0, '1900-01-01'],
    ['9999-12-31', 0, '9999-12-31'],
  ])('aggiunge %s + %i giorni', (iso, days, expected) => {
    expect(addDays(iso, days)).toBe(expected);
  });

  it.each([0.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rifiuta lo spostamento non valido %s',
    (days) => {
      expect(() => addDays('2024-01-01', days)).toThrow(RangeError);
    },
  );

  it.each([
    ['1900-01-01', -1],
    ['9999-12-31', 1],
    ['2024-01-01', Number.MAX_SAFE_INTEGER],
  ])('rifiuta risultati fuori intervallo da %s con %s giorni', (iso, days) => {
    expect(() => addDays(iso, days)).toThrow(RangeError);
  });
});

describe('fuso orario e formattazione', () => {
  it.each(['UTC', 'Europe/Rome', 'America/New_York', 'Pacific/Kiritimati'])(
    'mantiene le date civili nel fuso %s anche al cambio ora',
    (timeZone) => {
      vi.stubEnv('TZ', timeZone);
      expect(addDays('2024-03-30', 2)).toBe('2024-04-01');
      expect(addDays('2024-10-26', 2)).toBe('2024-10-28');
      expect(calculateGestation('2024-03-30', '2024-04-01')).toEqual({
        ok: true,
        value: {
          elapsedDays: 2,
          weeks: 0,
          days: 2,
          dueDate: '2025-01-04',
          progress: (2 / 280) * 100,
        },
      });
      expect(formatDate('2024-03-31')).toBe('31 marzo 2024');
      expect(formatDate('2024-01-01')).toBe('1 gennaio 2024');
    },
  );

  it('formatta giorno, mese e anno in italiano', () => {
    expect(formatDate('2024-02-29')).toBe('29 febbraio 2024');
    expect(formatDate('2024-12-31')).toBe('31 dicembre 2024');
  });
});

describe('todayIso', () => {
  it('usa i componenti locali, non quelli UTC, con zeri iniziali', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-12-31T23:30:00Z'));
    vi.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2025);
    vi.spyOn(Date.prototype, 'getMonth').mockReturnValue(0);
    vi.spyOn(Date.prototype, 'getDate').mockReturnValue(1);
    expect(todayIso()).toBe('2025-01-01');
  });

  it('legge nuovamente la data corrente a ogni chiamata', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 15, 12));
    expect(todayIso()).toBe('2024-06-15');
    vi.setSystemTime(new Date(2024, 5, 16, 12));
    expect(todayIso()).toBe('2024-06-16');
  });
});
