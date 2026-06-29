"use strict";
/**
 * Payment-method detection. bKash / Nagad / Rocket are the dominant mobile
 * financial services in Bangladesh, so they get first-class keywords.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPaymentMethod = extractPaymentMethod;
const normalize_1 = require("./normalize");
const RULES = [
    { method: "bkash", words: ["bkash", "bikash", "bekash", "বিকাশ"] },
    { method: "nagad", words: ["nagad", "nogod", "নগদ"] },
    { method: "rocket", words: ["rocket", "রকেট"] },
    { method: "card", words: ["card", "debit", "credit", "visa", "mastercard"] },
    { method: "bank", words: ["bank", "neft", "rtgs", "cheque", "check transfer"] },
    { method: "cash", words: ["cash", "nogod taka", "hate", "hate hate", "khuchra"] },
];
function extractPaymentMethod(rawText) {
    const text = (0, normalize_1.normalize)(rawText);
    for (const rule of RULES) {
        if (rule.words.some((w) => text.includes(w)))
            return rule.method;
    }
    return null;
}
