/**
 * Voice command intents. Sits in front of the capture parser: a transcript is
 * first classified into one of these, then the app routes it to an action.
 *
 * This is a deterministic grammar — it recognizes patterns, not arbitrary
 * phrasing. The supported shapes are documented per-intent in parse.ts and
 * surfaced to the user as example commands in the UI.
 */

import type { Category, ParsedTransaction } from "../types";

export type Period = "today" | "week" | "month" | "all";

/** How to find an existing transaction the user referred to by voice. */
export interface TargetQuery {
  /** "my last lunch" → "last"; "the oldest" → "first"; otherwise null. */
  ordinal: "last" | "first" | null;
  category: Category | null;
  counterparty: string | null;
  /** "the 600 one" → 600. */
  amount: number | null;
}

/** Field changes for an edit command. Only set fields are changed. */
export interface TransactionChanges {
  amount?: number;
  category?: Category;
  direction?: "expense" | "income";
  counterparty?: string;
  note?: string;
}

export interface QuerySpec {
  metric: "total_spend" | "balance" | "by_category";
  category: Category | null;
  period: Period;
}

/** Discriminated union of everything the user can ask for by voice. */
export type Command =
  | { kind: "create"; draft: ParsedTransaction; confidence: number }
  | { kind: "delete"; target: TargetQuery; confidence: number }
  | {
      kind: "update";
      target: TargetQuery;
      changes: TransactionChanges;
      confidence: number;
    }
  | { kind: "query"; query: QuerySpec; confidence: number }
  | { kind: "set_limit"; which: "daily" | "monthly"; amount: number; confidence: number }
  | { kind: "navigate"; to: "home" | "insights"; confidence: number }
  | { kind: "unknown"; transcript: string; confidence: 0 };

/**
 * App-agnostic view of a stored transaction, used for reference resolution and
 * queries. The web app maps its `expenses` rows onto this shape.
 */
export interface ExpenseRecord {
  id: number | string;
  title: string;
  /** Absolute amount (always positive); `type` carries the sign. */
  amount: number;
  type: "add" | "remove";
  category: string | null;
  details: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
}
