import { describe, expect, it } from 'vitest';
import { parseSavedDates } from './saved-dates';

describe('date salvate', () => {
  it('ripristina solo la coppia valida', () => {
    expect(parseSavedDates('{"lmp":"2026-06-08","dueDate":"2027-03-15"}', '2026-10-29'))
      .toEqual({ lmp: '2026-06-08', dueDate: '2027-03-15' });
  });
  it.each([
    '{', 'null', '[]', '{}', '{"lmp":12,"dueDate":false}',
    '{"lmp":"2026-02-30","dueDate":"2026-12-07"}',
    '{"lmp":"2026-06-08","dueDate":"2027-03-16"}',
    '{"lmp":"2027-06-08","dueDate":"2028-03-14"}',
  ])('rifiuta dati corrotti o incoerenti: %s', (raw) => {
    expect(() => parseSavedDates(raw, '2026-10-29')).toThrow();
  });
});
