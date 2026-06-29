/**
 * Reference resolution and query execution over stored transactions.
 *
 * Both run client-side against the already-loaded expense list — no extra API
 * calls. `resolveTarget` returns ranked candidates (best first) so the UI can
 * show the match for confirmation before any destructive action.
 */

import type { Category } from "../types";
import { CATEGORY_LABELS } from "../types";
import type { ExpenseRecord, Period, QuerySpec, TargetQuery } from "./types";

function startOfPeriod(period: Period, now: Date): Date | null {
  if (period === "all") return null;
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  if (period === "today") return d;
  if (period === "week") {
    d.setDate(d.getDate() - d.getDay()); // week starts Sunday
    return d;
  }
  // month
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function inPeriod(iso: string, period: Period, now: Date): boolean {
  const start = startOfPeriod(period, now);
  if (!start) return true;
  return new Date(iso).getTime() >= start.getTime();
}

/**
 * Rank stored records against a spoken reference. Filters by any specified
 * facet (category / counterparty / amount), then orders by recency. `first`
 * flips to oldest-first. Returns [] when nothing matches.
 */
export function resolveTarget(q: TargetQuery, records: ExpenseRecord[]): ExpenseRecord[] {
  let c = records.slice();

  if (q.category) c = c.filter((r) => r.category === q.category);
  if (q.counterparty) {
    const needle = q.counterparty.toLowerCase();
    c = c.filter(
      (r) =>
        r.title.toLowerCase().includes(needle) ||
        r.details.toLowerCase().includes(needle)
    );
  }
  if (q.amount !== null) {
    c = c.filter((r) => Math.abs(r.amount - (q.amount as number)) < 0.01);
  }

  c.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (q.ordinal === "first") c.reverse();
  return c;
}

export interface QueryResult {
  metric: QuerySpec["metric"];
  /** For total_spend: the summed amount. For by_category: omitted. */
  total: number;
  count: number;
  category: Category | null;
  period: Period;
  /** For by_category breakdowns. */
  breakdown?: Array<{ category: Category; total: number }>;
  /** A ready-to-speak/display sentence. `balance` is filled in by the caller. */
  text: string;
}

const taka = (n: number) =>
  `৳${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const periodPhrase: Record<Period, string> = {
  today: "today",
  week: "this week",
  month: "this month",
  all: "in total",
};

/**
 * Execute a spending query. `balance` is not computed here (it needs the user's
 * opening balance) — the UI handles that case and only uses this for spend.
 */
export function runQuery(
  spec: QuerySpec,
  records: ExpenseRecord[],
  now: Date = new Date()
): QueryResult {
  const spend = records.filter(
    (r) => r.type === "remove" && inPeriod(r.createdAt, spec.period, now)
  );

  if (spec.metric === "by_category") {
    const map = new Map<string, number>();
    for (const r of spend) {
      const key = r.category ?? "other";
      map.set(key, (map.get(key) ?? 0) + r.amount);
    }
    const breakdown = [...map.entries()]
      .map(([category, total]) => ({ category: category as Category, total }))
      .sort((a, b) => b.total - a.total);
    const total = breakdown.reduce((s, b) => s + b.total, 0);
    return {
      metric: "by_category",
      total,
      count: spend.length,
      category: null,
      period: spec.period,
      breakdown,
      text: `You spent ${taka(total)} ${periodPhrase[spec.period]}.`,
    };
  }

  // total_spend (optionally filtered by category)
  const filtered = spec.category
    ? spend.filter((r) => r.category === spec.category)
    : spend;
  const total = filtered.reduce((s, r) => s + r.amount, 0);
  const where = spec.category ? ` on ${CATEGORY_LABELS[spec.category]}` : "";
  return {
    metric: "total_spend",
    total,
    count: filtered.length,
    category: spec.category,
    period: spec.period,
    text:
      filtered.length === 0
        ? `No spending${where} ${periodPhrase[spec.period]}.`
        : `You spent ${taka(total)}${where} ${periodPhrase[spec.period]} across ${filtered.length} ${
            filtered.length === 1 ? "transaction" : "transactions"
          }.`,
  };
}
