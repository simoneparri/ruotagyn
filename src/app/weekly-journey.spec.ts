import { describe, expect, it } from 'vitest';
import { JOURNEY_EVENTS, weeklyJourney } from './weekly-journey';

describe('percorso settimanale informativo', () => {
  it('copre tutte le settimane con focus distinti e link verificabili', () => {
    const focuses = new Set<string>();
    for (let week = 0; week <= 42; week++) {
      const content = weeklyJourney(week);
      expect(content.week).toBe(week);
      expect(content.focus.length).toBeGreaterThan(30);
      focuses.add(content.focus);
      for (const event of content.events) {
        expect(event.source.url).toMatch(/^https:\/\//);
        expect(event.firstDay).toBeLessThanOrEqual(week * 7 + 6);
        expect(event.lastDay).toBeGreaterThanOrEqual(week * 7);
      }
      if (content.size) {
        expect(content.size.value).toBeGreaterThan(0);
        expect(content.size.source.url).toMatch(/^https:\/\//);
        expect(content.animal?.unit).toBe(content.size.unit);
        expect(content.animal?.source.url).toMatch(/^https:\/\//);
      }
    }
    expect(focuses.size).toBe(43);
  });

  it('riusa le mediane e distingue le lunghezze indicative dalle misure a +0', () => {
    expect(weeklyJourney(4).size?.formatted).toBe('0,2 cm');
    expect(weeklyJourney(5).size?.formatted).toBe('0,2 cm');
    expect(weeklyJourney(8).size?.value).toBe(1.6);
    expect(weeklyJourney(8).size?.note).toContain('non mediana');
    expect(weeklyJourney(9).size?.value).toBe(2.19);
    expect(weeklyJourney(13).size?.label).toContain('CRL');
    expect(weeklyJourney(13).size?.age).toBe('13+0');
    expect(weeklyJourney(14).size?.value).toBe(90);
    expect(weeklyJourney(20).size?.formatted).toBe('330 g');
    expect(weeklyJourney(40).size?.value).toBe(3617);
    for (const week of [0, 1, 2, 3, 41, 42]) {
      expect(weeklyJourney(week).size).toBeNull();
      expect(weeklyJourney(week).animal).toBeNull();
      expect(weeklyJourney(week).unavailable).not.toBe('');
    }
  });

  it('non estende le finestre oltre i limiti ISS e dichiara il limite a 21+0', () => {
    const eventWeeks = (id: string) => Array.from({ length: 43 }, (_, week) => week)
      .filter((week) => weeklyJourney(week).events.some((event) => event.id === id));
    expect(eventWeeks('combined')).toEqual([11, 12, 13]);
    expect(eventWeeks('first-ultrasound')).toEqual([11, 12, 13]);
    expect(eventWeeks('morphology')).toEqual([19, 20, 21]);
    const morphology = JOURNEY_EVENTS.find((event) => event.id === 'morphology');
    expect(morphology?.lastDay).toBe(21 * 7);
    expect(morphology?.window).toBe('19+0–21+0');
    expect(eventWeeks('gbs')).toEqual([36, 37]);
    expect(eventWeeks('fundal-height')).toEqual(Array.from({ length: 19 }, (_, index) => index + 24));
    expect(weeklyJourney(13).events.find((event) => event.id === 'combined')?.text).toContain('non per fare diagnosi');
  });

  it('esplicita la dimensione animale e il rapporto senza confondere peso e lunghezza', () => {
    expect(weeklyJourney(4).animal?.percentage).toBe('17%');
    expect(weeklyJourney(11).animal?.basis).toContain('guscio');
    expect(weeklyJourney(13).animal?.basis).toContain('coda esclusa');
    expect(weeklyJourney(20).animal?.unit).toBe('g');
    expect(weeklyJourney(20).animal?.percentage).toBe('55%');
    expect(weeklyJourney(10).animal?.percentage).toBe('82%');
    expect(weeklyJourney(27).animal?.percentage).toBe('104%');
    expect(weeklyJourney(29).animal?.percentage).toBe('135%');
    for (let week = 18; week <= 23; week++) {
      expect(weeklyJourney(week).animal).toMatchObject({
        label: 'Scoiattolo rosso', emoji: '🐿️', referenceValue: 600,
        source: { url: 'https://animaldiversity.org/accounts/Sciurus_vulgaris/' },
      });
    }
    expect(weeklyJourney(40).animal?.label).toBe('Gatto domestico');
    for (let week = 4; week <= 40; week++) {
      expect(weeklyJourney(week).animal?.emoji).not.toBe('');
      expect(weeklyJourney(week).animal?.referenceValue).toBeGreaterThan(0);
    }
  });

  it('rifiuta settimane invalide senza correggerle o sostituirle', () => {
    for (const week of [-1, 43, 20.5, NaN, Infinity]) {
      expect(() => weeklyJourney(week)).toThrow(RangeError);
    }
  });
});
