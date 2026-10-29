import { calculateGestation } from './gestation';

export const DATES_STORAGE_KEY = 'ruotagyn.dates.v1';

export interface SavedDates {
  lmp: string;
  dueDate: string;
}

export function parseSavedDates(raw: string, today: string): SavedDates {
  const value: unknown = JSON.parse(raw);
  if (typeof value !== 'object' || value === null ||
    !('lmp' in value) || typeof value.lmp !== 'string' ||
    !('dueDate' in value) || typeof value.dueDate !== 'string') {
    throw new RangeError('Formato delle date salvate non valido.');
  }
  const result = calculateGestation(value.lmp, today);
  if (!result.ok || result.value.dueDate !== value.dueDate) {
    throw new RangeError('Le date salvate non sono valide o non distano 280 giorni.');
  }
  return { lmp: value.lmp, dueDate: value.dueDate };
}
