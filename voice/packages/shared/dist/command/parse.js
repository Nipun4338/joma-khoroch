"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCommand = parseCommand;
const normalize_1 = require("../parser/normalize");
const amount_1 = require("../parser/amount");
const category_1 = require("../parser/category");
const counterparty_1 = require("../parser/counterparty");
const parser_1 = require("../parser");
const DELETE_RE = /\b(delete|remove|cancel|muche|baad|mucho)\b/;
const EDIT_RE = /\b(change|update|edit|recategorize|rename|make)\b/;
const LIMIT_RE = /\b(limit|target)\b/;
const BALANCE_RE = /\b(balance|baki)\b/;
const TOTAL_RE = /\b(how much|how many|koto|total|ktotal)\b/;
const NAV_INSIGHTS_RE = /\b(insight|insights|report|reports|analytics|chart|charts)\b/;
const NAV_HOME_RE = /\b(home|dashboard|main)\b/;
function detectPeriod(text) {
    if (/\b(today|aj|ajke)\b/.test(text))
        return "today";
    if (/\b(this week|week|saptah|saptaho)\b/.test(text))
        return "week";
    if (/\b(this month|month|mas|mash)\b/.test(text))
        return "month";
    return "month"; // most useful default for a spending question
}
/** Pull a category out of a fragment, or null if none is confident. */
function categoryOf(text) {
    const r = (0, category_1.extractCategory)(text);
    return r.category !== "other" && r.confidence > 0 ? r.category : null;
}
function parseTarget(text) {
    const norm = (0, normalize_1.normalize)(text);
    const ordinal = /\b(last|recent|latest|sesh|previous)\b/.test(norm)
        ? "last"
        : /\b(first|oldest|earliest)\b/.test(norm)
            ? "first"
            : null;
    return {
        ordinal,
        category: categoryOf(norm),
        counterparty: (0, counterparty_1.extractCounterparty)(text).counterparty,
        amount: (0, amount_1.extractAmount)(norm).amount,
    };
}
function parseUpdate(text) {
    const norm = (0, normalize_1.normalize)(text);
    const changes = {};
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
function parseCommand(transcript) {
    const raw = transcript ?? "";
    const text = (0, normalize_1.normalize)(raw);
    if (!text)
        return { kind: "unknown", transcript: raw, confidence: 0 };
    // 1. delete (regex for romanized/English; includes() for Bangla script,
    //    since \b word boundaries don't fire around Bangla characters)
    if (DELETE_RE.test(text) || ["মুছে", "বাদ দাও", "ডিলিট"].some((w) => text.includes(w))) {
        return { kind: "delete", target: parseTarget(text), confidence: 0.9 };
    }
    // 2. set_limit (a limit/target keyword + an amount)
    if (LIMIT_RE.test(text)) {
        const amount = (0, amount_1.extractAmount)(text).amount;
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
    if (BALANCE_RE.test(text) || ["ব্যালেন্স", "ব্যালান্স"].some((w) => text.includes(w))) {
        return {
            kind: "query",
            query: { metric: "balance", category: null, period: "all" },
            confidence: 0.85,
        };
    }
    if (TOTAL_RE.test(text) || text.includes("কত খরচ") || text.includes("কত টাকা")) {
        const query = {
            metric: "total_spend",
            category: categoryOf(text),
            period: detectPeriod(text),
        };
        return { kind: "query", query, confidence: 0.85 };
    }
    // 6. create (the original capture path) — only if there's an amount.
    const draft = (0, parser_1.parseTranscript)(raw);
    if (draft.amount !== null) {
        return { kind: "create", draft, confidence: draft.confidence };
    }
    // 7. unknown
    return { kind: "unknown", transcript: raw, confidence: 0 };
}
