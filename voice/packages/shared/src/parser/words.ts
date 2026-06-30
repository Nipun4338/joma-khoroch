/**
 * Spelled-out number parsing for amounts, English + romanized Bangla.
 *
 * Complements the digit parser in amount.ts (which handles "600", "5k",
 * "5 hazar"). This handles fully-spelled amounts people actually say:
 *   "five hundred"        → 500
 *   "panch sho taka"      → 500
 *   "dosh hajar"          → 10000
 *   "ek lakh"             → 100000
 *   "two thousand five hundred" → 2500
 *
 * Romanized Bangla numbers are irregular, so we deliberately include only the
 * unambiguous, commonly-spoken words (1–10, a few tens, and the scales). Bangla
 * *script* digits (৫০০) are already converted upstream by normalize().
 */

import { normalize } from "./normalize";

/** Small number words → value. English + safe romanized Bangla. */
const UNITS: Record<string, number> = {
  // english
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90,
  // romanized bangla (1–10)
  ek: 1, dui: 2, tin: 3, char: 4, panch: 5, choy: 6, chhoy: 6, sat: 7,
  shat: 7, ath: 8, at: 8, noy: 9, noi: 9, dosh: 10,
  // romanized bangla teens / tens (unambiguous ones only)
  egaro: 11, baro: 12, tero: 13, choddo: 14, ponero: 15, sholo: 16,
  bish: 20, kuri: 20, tirish: 30, chollish: 40, ponchash: 50,
};

/** Scale/multiplier words. */
const SCALES: Record<string, number> = {
  hundred: 100, sho: 100, shoto: 100,
  thousand: 1000, hajar: 1000, hazar: 1000,
  lakh: 100000, lac: 100000,
  million: 1000000,
};

interface ComposeResult {
  value: number;
  /** Whether a scale word (hundred/thousand/…) was part of the number. */
  hadScale: boolean;
}

/** Evaluate one contiguous run of number words using place-value composition. */
function composeRun(tokens: string[]): ComposeResult | null {
  let total = 0;
  let current = 0;
  let hadScale = false;
  let used = false;

  for (const t of tokens) {
    if (t in UNITS) {
      current += UNITS[t];
      used = true;
    } else {
      const s = SCALES[t];
      hadScale = true;
      used = true;
      if (s === 100) current = (current || 1) * 100;
      else {
        total += (current || 1) * s;
        current = 0;
      }
    }
  }

  if (!used) return null;
  const value = total + current;
  return value > 0 ? { value, hadScale } : null;
}

/**
 * Parse the largest spelled-out number in the text. Splits on non-number words
 * so "five hundred on lunch with two friends" yields 500 (not 502). Returns
 * null when there are no number words.
 */
export function wordsToNumber(text: string): ComposeResult | null {
  const toks = normalize(text).split(/[^a-z]+/).filter(Boolean);
  const runs: string[][] = [];
  let cur: string[] = [];
  for (const t of toks) {
    if (t in UNITS || t in SCALES) cur.push(t);
    else if (cur.length) {
      runs.push(cur);
      cur = [];
    }
  }
  if (cur.length) runs.push(cur);

  let best: ComposeResult | null = null;
  for (const r of runs) {
    const v = composeRun(r);
    if (v && (!best || v.value > best.value)) best = v;
  }
  return best;
}
