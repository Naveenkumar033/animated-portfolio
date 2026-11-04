import { describe, expect, it } from 'vitest';
import { inr } from '../../src/utils/format.js';

describe('inr', () => {
  it('formats rupees with Indian digit grouping', () => {
    expect(inr(549)).toBe('₹549');
    expect(inr(125000)).toBe('₹1,25,000');
  });
});
