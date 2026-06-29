/**
 * The voice-capture parser: free-text transcript → ParsedTransaction.
 *
 * This is a deterministic, offline, heuristic parser — no network, no model.
 * It's the v1 baseline and the contract the rest of the app codes against.
 * When/if accuracy demands it, swap the body of `parseTranscript` for an LLM
 * call that returns the same ParsedTransaction shape; nothing else changes.
 */

import type { ParsedTransaction } from "../types";
import { extractAmount } from "./amount";
import { extractCategory } from "./category";
import { extractCounterparty } from "./counterparty";
import { extractDirection } from "./direction";
import { extractPaymentMethod } from "./payment";

export * from "./normalize";
export { extractAmount } from "./amount";
export { extractCategory } from "./category";
export { extractCounterparty } from "./counterparty";
export { extractDirection } from "./direction";
export { extractPaymentMethod } from "./payment";

export function parseTranscript(rawTranscript: string): ParsedTransaction {
  const text = rawTranscript ?? "";

  const amount = extractAmount(text);
  const category = extractCategory(text);
  const counterparty = extractCounterparty(text);
  const payment = extractPaymentMethod(text);
  const directionRaw = extractDirection(text);

  // Cross-check: a "salary"/"income" category is inbound by definition.
  const direction =
    category.category === "salary" ? "income" : directionRaw.direction;

  // Weighted blend. Amount is the field we most need to be right; if we got no
  // amount at all the whole capture is suspect, so we hard-cap confidence.
  let confidence =
    amount.confidence * 0.5 +
    category.confidence * 0.3 +
    directionRaw.confidence * 0.2;
  if (amount.amount === null) confidence = Math.min(confidence, 0.25);

  return {
    amount: amount.amount,
    direction,
    category: category.category,
    counterparty: counterparty.counterparty,
    paymentMethod: payment,
    note: text.trim().replace(/\s+/g, " "),
    rawTranscript: text,
    confidence: Number(confidence.toFixed(2)),
  };
}
