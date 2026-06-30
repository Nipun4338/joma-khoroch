/**
 * parseCommand: transcript → Command (intent + entities).
 *
 * Detection runs in a fixed precedence so overlapping keywords resolve
 * predictably:
 *   1. delete   — "delete/remove ..."
 *   2. set_limit — mentions a limit/target + an amount ("set daily limit to 1000")
 *   3. navigate — names a destination ("show insights", "go home")
 *   4. update   — "change/edit/recategorize ..."
 *   5. query    — "how much ...", "what's my balance"
 *   6. create   — falls through here if there's an amount (the capture path)
 *   7. unknown  — nothing recognized
 *
 * Supported edit/delete phrasings (deterministic, not free-form):
 *   delete:  "delete my last lunch", "remove the 600 taka one", "delete the last one"
 *   update:  "change that 600 to 700", "make the last one 450",
 *            "recategorize my last lunch as groceries"
 *   query:   "how much did I spend on food this week", "what's my balance"
 *   limit:   "set my daily limit to 1000", "monthly target 30000"
 *   nav:     "show insights", "go to dashboard"
 */

import type { Category } from "../types";
import { normalize } from "../parser/normalize";
import { extractAmount } from "../parser/amount";
import { extractCategory } from "../parser/category";
import { extractCounterparty } from "../parser/counterparty";
import { parseTranscript } from "../parser";
import type { Command, Period, QuerySpec, TargetQuery, TransactionChanges } from "./types";

const DELETE_RE = /\b(delete|remove|cancel|muche|baad|mucho)\b/;
const EDIT_RE = /\b(change|update|edit|recategorize|rename|make)\b/;
const LIMIT_RE = /\b(limit|target)\b/;
const BALANCE_RE = /\b(balance|baki)\b/;
const TOTAL_RE = /\b(how much|how many|koto|total|ktotal)\b/;
const NAV_INSIGHTS_RE = /\b(insight|insights|report|reports|analytics|chart|charts)\b/;
const NAV_HOME_RE = /\b(home|dashboard|main)\b/;

function detectPeriod(text: string): Period {
  if (/\b(today|aj|ajke)\b/.test(text)) return "today";
  if (/\b(this week|week|saptah|saptaho)\b/.test(text)) return "week";
  if (/\b(this month|month|mas|mash)\b/.test(text)) return "month";
  return "month"; // most useful default for a spending question
}

/** Pull a category out of a fragment, or null if none is confident. */
function categoryOf(text: string): Category | null {
  const r = extractCategory(text);
  return r.category !== "other" && r.confidence > 0 ? r.category : null;
}

function parseTarget(text: string): TargetQuery {
  const norm = normalize(text);
  const ordinal: TargetQuery["ordinal"] = /\b(last|recent|latest|sesh|previous)\b/.test(
    norm
  )
    ? "last"
    : /\b(first|oldest|earliest)\b/.test(norm)
      ? "first"
      : null;
  return {
    ordinal,
    category: categoryOf(norm),
    counterparty: extractCounterparty(text).counterparty,
    amount: extractAmount(norm).amount,
  };
}

function parseUpdate(text: string): { target: TargetQuery; changes: TransactionChanges } {
  const norm = normalize(text);
  const changes: TransactionChanges = {};
  let targetText = norm;

  // Amount change: "to 700" / "make it 700" / "make the last one 450".
  const amt = norm.match(/\b(?:to|make it|make the [a-z ]+?one)\s+(\d[\d,]*(?:\.\d+)?)/);
  if (amt && amt.index !== undefined) {
    changes.amount = parseFloat(amt[1].replace(/,/g, ""));
    targetText = norm.slice(0, amt.index);
  }

  // Category change: "as groceries" / "into food" / "recategorize as health".
  const cat = norm.match(/\b(?:as|into|category to)\s+([a-z ]+)$/);
  if (cat && cat.index !== undefined) {
    const c = categoryOf(cat[1]);
    if (c) {
      changes.category = c;
      targetText = norm.slice(0, cat.index);
    }
  }

  return { target: parseTarget(targetText), changes };
}

export function parseCommand(transcript: string): Command {
  const raw = transcript ?? "";
  const text = normalize(raw);
  if (!text) return { kind: "unknown", transcript: raw, confidence: 0 };

  // 1. delete
  if (DELETE_RE.test(text)) {
    return { kind: "delete", target: parseTarget(text), confidence: 0.9 };
  }

  // 2. set_limit (a limit/target keyword + an amount)
  if (LIMIT_RE.test(text)) {
    const amount = extractAmount(text).amount;
    if (amount !== null) {
      const which = /\bmonth|\bmonthly|\bmas|\btarget\b/.test(text) ? "monthly" : "daily";
      return { kind: "set_limit", which, amount, confidence: 0.9 };
    }
  }

  // 3. navigate
  if (NAV_INSIGHTS_RE.test(text)) {
    return { kind: "navigate", to: "insights", confidence: 0.9 };
  }
  if (NAV_HOME_RE.test(text) && /\b(go|open|show|navigate|take me)\b/.test(text)) {
    return { kind: "navigate", to: "home", confidence: 0.85 };
  }

  // 4. update
  if (EDIT_RE.test(text)) {
    const { target, changes } = parseUpdate(text);
    if (changes.amount !== undefined || changes.category !== undefined) {
      return { kind: "update", target, changes, confidence: 0.85 };
    }
  }

  // 5. query
  if (BALANCE_RE.test(text)) {
    return {
      kind: "query",
      query: { metric: "balance", category: null, period: "all" },
      confidence: 0.85,
    };
  }
  if (TOTAL_RE.test(text)) {
    const query: QuerySpec = {
      metric: "total_spend",
      category: categoryOf(text),
      period: detectPeriod(text),
    };
    return { kind: "query", query, confidence: 0.85 };
  }

  // 6. create (the original capture path) — only if there's an amount.
  const draft = parseTranscript(raw);
  if (draft.amount !== null) {
    return { kind: "create", draft, confidence: draft.confidence };
  }

  // 7. unknown
  return { kind: "unknown", transcript: raw, confidence: 0 };
}
