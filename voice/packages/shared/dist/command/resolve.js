"use strict";
/**
 * Reference resolution and query execution over stored transactions.
 *
 * Both run client-side against the already-loaded expense list — no extra API
 * calls. `resolveTarget` returns ranked candidates (best first) so the UI can
 * show the match for confirmation before any destructive action.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveTarget = resolveTarget;
exports.runQuery = runQuery;
const types_1 = require("../types");
function startOfPeriod(period, now) {
    if (period === "all")
        return null;
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    if (period === "today")
        return d;
    if (period === "week") {
        d.setDate(d.getDate() - d.getDay()); // week starts Sunday
        return d;
    }
    // month
    return new Date(now.getFullYear(), now.getMonth(), 1);
}
function inPeriod(iso, period, now) {
    const start = startOfPeriod(period, now);
    if (!start)
        return true;
    return new Date(iso).getTime() >= start.getTime();
}
/**
 * Rank stored records against a spoken reference. Filters by any specified
 * facet (category / counterparty / amount), then orders by recency. `first`
 * flips to oldest-first. Returns [] when nothing matches.
 */
function resolveTarget(q, records) {
    let c = records.slice();
    if (q.category)
        c = c.filter((r) => r.category === q.category);
    if (q.counterparty) {
        const needle = q.counterparty.toLowerCase();
        c = c.filter((r) => r.title.toLowerCase().includes(needle) ||
            r.details.toLowerCase().includes(needle));
    }
    if (q.amount !== null) {
        c = c.filter((r) => Math.abs(r.amount - q.amount) < 0.01);
    }
    c.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (q.ordinal === "first")
        c.reverse();
    return c;
}
const taka = (n) => `৳${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const periodPhrase = {
    today: "today",
    week: "this week",
    month: "this month",
    all: "in total",
};
/**
 * Execute a spending query. `balance` is not computed here (it needs the user's
 * opening balance) — the UI handles that case and only uses this for spend.
 */
function runQuery(spec, records, now = new Date()) {
    const spend = records.filter((r) => r.type === "remove" && inPeriod(r.createdAt, spec.period, now));
    if (spec.metric === "by_category") {
        const map = new Map();
        for (const r of spend) {
            const key = r.category ?? "other";
            map.set(key, (map.get(key) ?? 0) + r.amount);
        }
        const breakdown = [...map.entries()]
            .map(([category, total]) => ({ category: category, total }))
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
    const where = spec.category ? ` on ${types_1.CATEGORY_LABELS[spec.category]}` : "";
    return {
        metric: "total_spend",
        total,
        count: filtered.length,
        category: spec.category,
        period: spec.period,
        text: filtered.length === 0
            ? `No spending${where} ${periodPhrase[spec.period]}.`
            : `You spent ${taka(total)}${where} ${periodPhrase[spec.period]} across ${filtered.length} ${filtered.length === 1 ? "transaction" : "transactions"}.`,
    };
}
