"use strict";
/**
 * Text normalization shared by every parser stage.
 *
 * Bangladeshi voice input is heavily code-switched: a single sentence can mix
 * English words, Bangla words, Latin digits and Bangla digits. We flatten all
 * of that to a predictable lowercase ASCII-digit string before matching.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.banglaDigitsToAscii = banglaDigitsToAscii;
exports.normalize = normalize;
exports.tokens = tokens;
/** Bangla (Bengali) digit → ASCII digit. */
const BANGLA_DIGITS = {
    "০": "0",
    "১": "1",
    "২": "2",
    "৩": "3",
    "৪": "4",
    "৫": "5",
    "৬": "6",
    "৭": "7",
    "৮": "8",
    "৯": "9",
};
/** Convert any Bangla digits in the string to ASCII digits. */
function banglaDigitsToAscii(text) {
    return text.replace(/[০-৯]/g, (d) => BANGLA_DIGITS[d] ?? d);
}
/**
 * Lowercase, convert Bangla digits, and collapse whitespace. Punctuation is
 * kept (we strip it per-stage where needed) so counterparty names survive.
 */
function normalize(text) {
    return banglaDigitsToAscii(text).toLowerCase().replace(/\s+/g, " ").trim();
}
/** Tokenize on whitespace after normalizing. */
function tokens(text) {
    return normalize(text).split(" ").filter(Boolean);
}
