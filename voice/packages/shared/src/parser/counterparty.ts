/**
 * Counterparty (person or merchant) extraction.
 *
 * Two grammars to cover code-switching:
 *   English: "<verb> ... with/to/from <Name>"   → "lunch with Rafi"
 *   Bangla:  "<Name> ke/re ..."                 → "Rafi ke 500 dilam"
 *
 * On-device transcribers often emit lowercase text, so we can't rely on
 * capitalization to spot names — instead we take the token next to a relation
 * word and reject it if it's a known stop/category word.
 */

import { normalize } from "./normalize";

/** Relation words that introduce a name in English. */
const EN_PRECEDING = new Set(["with", "to", "from"]);
/** Bangla post-positions that follow a name. */
const BN_FOLLOWING = new Set(["ke", "re", "kache", "er"]);

/** Words that look like they follow "with/to" but aren't names. */
const STOP = new Set([
  "the", "a", "an", "my", "me", "him", "her", "them", "lunch", "dinner",
  "breakfast", "khabar", "bazar", "office", "home", "bari", "basa", "taka",
  "tk", "cash", "bkash", "nagad", "rocket", "buy", "get", "pay", "it",
]);

function isNameToken(tok: string): boolean {
  // Romanized name: alphabetic, at least 2 chars, not a stopword.
  return /^[a-z]{2,}$/.test(tok) && !STOP.has(tok);
}

/** Title-case a raw token, stripping edge punctuation. */
function display(rawToken: string): string {
  const clean = rawToken.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export interface CounterpartyResult {
  counterparty: string | null;
  confidence: number;
}

export function extractCounterparty(rawText: string): CounterpartyResult {
  const original = rawText.trim().replace(/\s+/g, " ");
  const oTokens = original.split(" ");
  const nTokens = normalize(rawText).split(" ");

  // English: relation word then a name.
  for (let i = 0; i < nTokens.length - 1; i++) {
    if (EN_PRECEDING.has(nTokens[i]) && isNameToken(nTokens[i + 1])) {
      return { counterparty: display(oTokens[i + 1] ?? nTokens[i + 1]), confidence: 0.8 };
    }
  }

  // Bangla: a name then a post-position.
  for (let i = 1; i < nTokens.length; i++) {
    if (BN_FOLLOWING.has(nTokens[i]) && isNameToken(nTokens[i - 1])) {
      return { counterparty: display(oTokens[i - 1] ?? nTokens[i - 1]), confidence: 0.75 };
    }
  }

  return { counterparty: null, confidence: 0 };
}
