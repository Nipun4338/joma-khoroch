/**
 * Reference resolution and query execution over stored transactions.
 *
 * Both run client-side against the already-loaded expense list — no extra API
 * calls. `resolveTarget` returns ranked candidates (best first) so the UI can
 * show the match for confirmation before any destructive action.
 */
import type { Category } from "../types";
import type { ExpenseRecord, Period, QuerySpec, TargetQuery } from "./types";
/**
 * Rank stored records against a spoken reference. Filters by any specified
 * facet (category / counterparty / amount), then orders by recency. `first`
 * flips to oldest-first. Returns [] when nothing matches.
 */
export declare function resolveTarget(q: TargetQuery, records: ExpenseRecord[]): ExpenseRecord[];
export interface QueryResult {
    metric: QuerySpec["metric"];
    /** For total_spend: the summed amount. For by_category: omitted. */
    total: number;
    count: number;
    category: Category | null;
    period: Period;
    /** For by_category breakdowns. */
    breakdown?: Array<{
        category: Category;
        total: number;
    }>;
    /** A ready-to-speak/display sentence. `balance` is filled in by the caller. */
    text: string;
}
/**
 * Execute a spending query. `balance` is not computed here (it needs the user's
 * opening balance) — the UI handles that case and only uses this for spend.
 */
export declare function runQuery(spec: QuerySpec, records: ExpenseRecord[], now?: Date): QueryResult;
