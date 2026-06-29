/**
 * Amount extraction.
 *
 * Handles digit amounts with optional scale words in both languages:
 *   "600", "5k", "5 hazar", "dui hajar" (digits only for now), "1.5 lakh".
 * Pure word-numbers ("panch sho" = 500 spelled out) are out of scope for v1 —
 * see the parser README for the LLM upgrade path.
 */

import { normalize } from "./normalize";

interface AmountMatch {
  value: number;
  index: number;
}

/** Scale words → multiplier. Ordered longest-first isn't needed; regex handles it. */
const SCALE: Record<string, number> = {
  k: 1000,
  hajar: 1000,
  hazar: 1000,
  thousand: 1000,
  shoto: 100,
  sho: 100,
  hundred: 100,
  lakh: 100000,
  lac: 100000,
  lac_: 100000,
};

/** Words that signal a token is money, used to disambiguate multiple numbers. */
const MONEY_WORDS = ["taka", "tk", "৳", "poisa", "tk.", "takা"];

const NUMBER_RE =
  /(\d+(?:\.\d+)?)\s*(k|hajar|hazar|thousand|shoto|sho|hundred|lakh|lac)?/gi;

function isMoneyAdjacent(text: string, idx: number): boolean {
  // Look a few chars before/after the match for a money word.
  const window = text.slice(Math.max(0, idx - 12), idx + 18);
  return MONEY_WORDS.some((w) => window.includes(w));
}

export interface AmountResult {
  amount: number | null;
  confidence: number;
}

export function extractAmount(rawText: string): AmountResult {
  const text = normalize(rawText);
  const matches: Array<AmountMatch & { moneyAdjacent: boolean }> = [];

  for (const m of text.matchAll(NUMBER_RE)) {
    const base = parseFloat(m[1]);
    if (Number.isNaN(base)) continue;
    const scale = m[2] ? SCALE[m[2].toLowerCase()] ?? 1 : 1;
    matches.push({
      value: base * scale,
      index: m.index ?? 0,
      moneyAdjacent: isMoneyAdjacent(text, m.index ?? 0),
    });
  }

  if (matches.length === 0) return { amount: null, confidence: 0 };

  // Prefer a number sitting next to a money word ("600 taka"); it's the most
  // reliable signal. Otherwise fall back to the first number we saw.
  const moneyAdjacent = matches.filter((m) => m.moneyAdjacent);
  if (moneyAdjacent.length === 1) {
    return { amount: moneyAdjacent[0].value, confidence: 0.95 };
  }
  if (moneyAdjacent.length > 1) {
    // Multiple "X taka" — ambiguous; take the largest, lower confidence.
    const best = moneyAdjacent.reduce((a, b) => (b.value > a.value ? b : a));
    return { amount: best.value, confidence: 0.6 };
  }

  if (matches.length === 1) {
    return { amount: matches[0].value, confidence: 0.85 };
  }
  // Several bare numbers, none flagged as money. Take the first, flag low.
  return { amount: matches[0].value, confidence: 0.5 };
}
