"use strict";
/**
 * Direction detection: did money go out (expense) or come in (income)?
 *
 * Default is `expense` — the overwhelming majority of voice captures are
 * spending. We only flip to `income` on a clear inbound signal.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDirection = extractDirection;
const normalize_1 = require("./normalize");
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
function extractDirection(rawText) {
    const text = (0, normalize_1.normalize)(rawText);
    const income = INCOME_SIGNALS.some((w) => text.includes(w));
    const expense = EXPENSE_SIGNALS.some((w) => text.includes(w));
    if (income && !expense)
        return { direction: "income", confidence: 0.85 };
    if (expense && !income)
        return { direction: "expense", confidence: 0.85 };
    if (income && expense)
        return { direction: "expense", confidence: 0.4 }; // mixed; default out
    return { direction: "expense", confidence: 0.5 }; // unmarked; assume spending
}
