/**
 * Direction detection: did money go out (expense) or come in (income)?
 *
 * Default is `expense` — the overwhelming majority of voice captures are
 * spending. We only flip to `income` on a clear inbound signal.
 */

import type { Direction } from "../types";
import { normalize } from "./normalize";

const INCOME_SIGNALS = [
  "received", "got paid", "salary", "beton pelam", "pelam", "peyechi",
  "income", "bonus", "refund", "ferot pelam", "cash in", "ese geche",
  "diye geche", "জমা", "পেলাম",
];

const EXPENSE_SIGNALS = [
  "spent", "spend", "paid", "kharach", "kharoch", "khoroch", "dilam", "dilam taka",
  "kinlam", "kinte", "bill dilam", "diye dilam", "cash out", "khoroch holo",
  "খরচ", "দিলাম",
];

export function extractDirection(rawText: string): { direction: Direction; confidence: number } {
  const text = normalize(rawText);
  const income = INCOME_SIGNALS.some((w) => text.includes(w));
  const expense = EXPENSE_SIGNALS.some((w) => text.includes(w));

  if (income && !expense) return { direction: "income", confidence: 0.85 };
  if (expense && !income) return { direction: "expense", confidence: 0.85 };
  if (income && expense) return { direction: "expense", confidence: 0.4 }; // mixed; default out
  return { direction: "expense", confidence: 0.5 }; // unmarked; assume spending
}
