import { describe, expect, it } from 'vitest';
import { clamp, ease, lerp, seeded, smooth } from '../../src/utils/math.js';

describe('math helpers', () => {
  it('clamps into range', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-2, 0, 1)).toBe(0);
    expect(clamp(.4, 0, 1)).toBe(.4);
  });
  it('interpolates', () => {
    expect(lerp(10, 20, .5)).toBe(15);
    expect(smooth(0, 1, .5)).toBeCloseTo(.5);
    expect(smooth(0, 1, 2)).toBe(1);
  });
  it('easings start at 0 and end at 1', () => {
    for (const k of ['out', 'inn', 'io', 'back', 'elastic', 'glide']){
      expect(ease[k](0)).toBeCloseTo(0, 5);
      expect(ease[k](1)).toBeCloseTo(1, 5);
    }
  });
  it('seeded random is repeatable and in [0, 1)', () => {
    const a = seeded(7), b = seeded(7);
    const xs = Array.from({ length:50 }, () => a());
    expect(xs).toEqual(Array.from({ length:50 }, () => b()));
    expect(xs.every(x => x >= 0 && x < 1)).toBe(true);
  });
});
