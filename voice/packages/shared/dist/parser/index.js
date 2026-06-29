"use strict";
/**
 * The voice-capture parser: free-text transcript → ParsedTransaction.
 *
 * This is a deterministic, offline, heuristic parser — no network, no model.
 * It's the v1 baseline and the contract the rest of the app codes against.
 * When/if accuracy demands it, swap the body of `parseTranscript` for an LLM
 * call that returns the same ParsedTransaction shape; nothing else changes.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPaymentMethod = exports.extractDirection = exports.extractCounterparty = exports.extractCategory = exports.extractAmount = void 0;
exports.parseTranscript = parseTranscript;
const amount_1 = require("./amount");
const category_1 = require("./category");
const counterparty_1 = require("./counterparty");
const direction_1 = require("./direction");
const payment_1 = require("./payment");
__exportStar(require("./normalize"), exports);
var amount_2 = require("./amount");
Object.defineProperty(exports, "extractAmount", { enumerable: true, get: function () { return amount_2.extractAmount; } });
var category_2 = require("./category");
Object.defineProperty(exports, "extractCategory", { enumerable: true, get: function () { return category_2.extractCategory; } });
var counterparty_2 = require("./counterparty");
Object.defineProperty(exports, "extractCounterparty", { enumerable: true, get: function () { return counterparty_2.extractCounterparty; } });
var direction_2 = require("./direction");
Object.defineProperty(exports, "extractDirection", { enumerable: true, get: function () { return direction_2.extractDirection; } });
var payment_2 = require("./payment");
Object.defineProperty(exports, "extractPaymentMethod", { enumerable: true, get: function () { return payment_2.extractPaymentMethod; } });
function parseTranscript(rawTranscript) {
    const text = rawTranscript ?? "";
    const amount = (0, amount_1.extractAmount)(text);
    const category = (0, category_1.extractCategory)(text);
    const counterparty = (0, counterparty_1.extractCounterparty)(text);
    const payment = (0, payment_1.extractPaymentMethod)(text);
    const directionRaw = (0, direction_1.extractDirection)(text);
    // Cross-check: a "salary"/"income" category is inbound by definition.
    const direction = category.category === "salary" ? "income" : directionRaw.direction;
    // Weighted blend. Amount is the field we most need to be right; if we got no
    // amount at all the whole capture is suspect, so we hard-cap confidence.
    let confidence = amount.confidence * 0.5 +
        category.confidence * 0.3 +
        directionRaw.confidence * 0.2;
    if (amount.amount === null)
        confidence = Math.min(confidence, 0.25);
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
