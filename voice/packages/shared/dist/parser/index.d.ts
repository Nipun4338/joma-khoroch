/**
 * The voice-capture parser: free-text transcript → ParsedTransaction.
 *
 * This is a deterministic, offline, heuristic parser — no network, no model.
 * It's the v1 baseline and the contract the rest of the app codes against.
 * When/if accuracy demands it, swap the body of `parseTranscript` for an LLM
 * call that returns the same ParsedTransaction shape; nothing else changes.
 */
import type { ParsedTransaction } from "../types";
export * from "./normalize";
export { extractAmount } from "./amount";
export { extractCategory } from "./category";
export { extractCounterparty } from "./counterparty";
export { extractDirection } from "./direction";
export { extractPaymentMethod } from "./payment";
export { wordsToNumber } from "./words";
export declare function parseTranscript(rawTranscript: string): ParsedTransaction;
