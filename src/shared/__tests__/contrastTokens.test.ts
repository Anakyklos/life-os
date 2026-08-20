import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_PATH = join(process.cwd(), 'tailwind.config.js');
const COCKPIT_THEME_PATH = join(process.cwd(), 'src/app/layout/cockpitTheme.ts');

function hexToRgb(hex: string): [number, number, number] {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) throw new Error(`invalid hex: ${hex}`);
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [la, lb] = [luminance(a), luminance(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function hexFromConfig(regex: RegExp): string {
  const hex = readFileSync(CONFIG_PATH, 'utf8').match(regex)?.[1];
  if (!hex) throw new Error(`color token missing from tailwind.config.js: ${regex}`);
  return hex;
}

function hexFromCockpitTheme(regex: RegExp): string {
  const hex = readFileSync(COCKPIT_THEME_PATH, 'utf8').match(regex)?.[1];
  if (!hex) throw new Error(`cockpit color token missing from cockpitTheme.ts: ${regex}`);
  return `#${hex}`;
}

const primaryHex = hexFromConfig(/"primary":\s*"#([0-9a-f]{6})"/i);
const primaryCtaHex = hexFromConfig(/"primary-cta":\s*"#([0-9a-f]{6})"/i);

const DARK_BG = '#030303';

describe('primary token contrast', () => {
  it('separates the CTA background from the text token', () => {
    expect(primaryHex).not.toBe(primaryCtaHex);
    expect(luminance(primaryCtaHex)).toBeLessThan(luminance(primaryHex));
  });

  it('keeps text-primary >= 4.5:1 on the dark background', () => {
    expect(contrast(primaryHex, DARK_BG)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the primary CTA >= 4.5:1 with white text', () => {
    expect(contrast(primaryCtaHex, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the cockpit CTA hover state >= 4.5:1 with white text', () => {
    const hoverHex = hexFromCockpitTheme(/primaryAction:\s*'[^']*hover:bg-\[#([0-9a-f]{6})\]/i);
    expect(contrast(hoverHex, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });
});
/** @vitest-environment jsdom */
