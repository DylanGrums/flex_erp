import { parseDuration } from './duration';

describe('parseDuration', () => {
  it('parses seconds, minutes, hours, and days', () => {
    expect(parseDuration('10s')).toBe(10_000);
    expect(parseDuration('2m')).toBe(120_000);
    expect(parseDuration('3h')).toBe(10_800_000);
    expect(parseDuration('1d')).toBe(86_400_000);
  });

  it('trims whitespace', () => {
    expect(parseDuration(' 5s ')).toBe(5_000);
  });

  it('throws on invalid format', () => {
    expect(() => parseDuration('bad')).toThrow('Bad duration: bad');
    expect(() => parseDuration('10w')).toThrow();
  });
});
