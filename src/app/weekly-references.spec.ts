import { describe, expect, it } from 'vitest';
import { REFERENCE_SOURCES, formatReference, weeklyReferences } from './weekly-references';

function reference(week: number, id: string) {
  const result = weeklyReferences(week).find((item) => item.id === id);
  if (!result) throw new Error(`Riferimento mancante: ${id}`);
  return result;
}

describe('riferimenti settimanali', () => {
  it('riporta i P50 WHO, converte mm in cm e mantiene il peso in grammi', () => {
    for (const [week, values] of [
      [14, [90, 2.7, 10.0, 8.1, 1.3, 1.4]],
      [20, [330, 4.7, 17.3, 15.0, 3.2, 3.1]],
      [40, [3617, 9.6, 34.2, 36.3, 7.3, 6.4]],
    ] as const) {
      ['efw', 'bpd', 'hc', 'ac', 'fl', 'hl'].forEach((id, index) => {
        expect(reference(week, id).value).toBe(values[index]);
        expect(reference(week, id).referenceAge).toBe(`${week}+0`);
        expect(reference(week, id).sourceId).toBe('who');
      });
    }
  });

  it('non confonde le righe FMF a +3 giorni con i dati a +0', () => {
    for (const [week, ua, mca] of [[20, 1.218, 1.486], [31, .986, 1.926], [41, .776, 1.177]]) {
      expect(reference(week, 'ua-pi').value).toBe(ua);
      expect(reference(week, 'mca-pi').value).toBe(mca);
      expect(reference(week, 'ua-pi').referenceAge).toBe(`${week}+3`);
      expect(reference(week, 'mca-pi').referenceAge).toBe(`${week}+3`);
    }
  });

  it('rispetta i limiti CRL e la tabella del peso materno', () => {
    expect(reference(9, 'crl').value).toBeCloseTo(2.19);
    expect(reference(14, 'crl').value).toBeCloseTo(8.06);
    expect(reference(8, 'crl').value).toBeNull();
    expect(reference(15, 'crl').value).toBeNull();
    expect(reference(15, 'gwg').value).toBe(.4);
    expect(reference(20, 'gwg').value).toBe(3.3);
    expect(reference(40, 'gwg').value).toBe(13.7);
    expect(reference(14, 'gwg').value).toBeNull();
    expect(reference(41, 'gwg').value).toBeNull();
    expect(reference(20, 'gwg').note).toContain('18,50–24,99');
  });

  it('non estrapola e non genera valori DAT o zeri sostitutivi', () => {
    for (let week = 0; week <= 42; week++) {
      const values = weeklyReferences(week);
      expect(values).toHaveLength(11);
      expect(new Set(values.map((item) => item.id)).size).toBe(11);
      expect(reference(week, 'tad').value).toBeNull();
      for (const item of values) {
        if (item.sourceId) expect(REFERENCE_SOURCES.some((source) => source.id === item.sourceId)).toBe(true);
        if (item.value !== null) {
          expect(item.value).toBeGreaterThan(0);
          expect(item.referenceAge).not.toBeNull();
        } else {
          expect(item.referenceAge).toBeNull();
          expect(formatReference(item)).toBe('Non disponibile');
        }
      }
      if (week < 14 || week > 40) expect(reference(week, 'efw').value).toBeNull();
      if (week < 20 || week > 41) expect(reference(week, 'ua-pi').value).toBeNull();
    }
    expect(weeklyReferences(42).every((item) => item.value === null)).toBe(true);
  });

  it('rifiuta input invalidi invece di arrotondarli silenziosamente', () => {
    for (const value of [-1, 43, 20.5, NaN, Infinity]) {
      expect(() => weeklyReferences(value)).toThrow(RangeError);
    }
  });

  it('formatta in italiano con precisione dichiarata e unita corrette', () => {
    expect(formatReference(reference(20, 'ua-pi'))).toBe('1,218');
    expect(formatReference(reference(20, 'efw'))).toBe('330 g');
    expect(formatReference(reference(20, 'hc'))).toBe('17,3 cm');
    expect(formatReference(reference(9, 'crl'))).toBe('2,19 cm');
  });
});
