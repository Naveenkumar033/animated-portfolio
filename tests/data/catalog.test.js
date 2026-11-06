import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BENEFITS } from '../../src/data/benefits.js';
import { HERBS } from '../../src/data/herbs.js';
import { NEEDS } from '../../src/data/needs.js';
import { NSTAGE, RX } from '../../src/data/pipeline.js';
import { PRODUCTS } from '../../src/data/products.js';
import { STORY } from '../../src/data/product-story.js';
import { SECTIONS } from '../../src/data/sections.js';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

describe('catalogue data', () => {
  it('products have unique ids and prices', () => {
    const ids = PRODUCTS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    PRODUCTS.forEach(p => { expect(p.price).toBeGreaterThan(0); expect(p.ing.length).toBeGreaterThan(0); });
  });
  it('every product story card, need and linked herb points at a real product', () => {
    expect(STORY).toHaveLength(PRODUCTS.length);
    NEEDS.forEach(n => expect(PRODUCTS[n.p]).toBeDefined());
    HERBS.forEach(h => { if (h.p != null) expect(PRODUCTS[h.p]).toBeDefined(); });
    expect(HERBS.some(h => h.p != null)).toBe(true);
  });
  it('every product has its product image, cut-out and design board', () => {
    PRODUCTS.forEach(p => ['', '-cut', '-design'].forEach(k =>
      expect(existsSync(new URL(`../../src/assets/products/${p.id}${k}.webp`, import.meta.url))).toBe(true)));
  });
  it('every product has benefits for the benefits panel', () => {
    PRODUCTS.forEach(p => expect(BENEFITS[p.id]?.length).toBeGreaterThan(2));
  });
  it('the pipeline has one entry per stage', () => {
    expect(RX).toHaveLength(NSTAGE);
  });
  it('every menu section exists on the page', () => {
    SECTIONS.forEach(s => expect(html).toContain(`id="${s.id}"`));
  });
});
