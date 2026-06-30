/**
 * Spelled-out number parsing for amounts, English + romanized Bangla.
 *
 * Complements the digit parser in amount.ts (which handles "600", "5k",
 * "5 hazar"). This handles fully-spelled amounts people actually say:
 *   "five hundred"        → 500
 *   "panch sho taka"      → 500
 *   "dosh hajar"          → 10000
 *   "ek lakh"             → 100000
 *   "two thousand five hundred" → 2500
 *
 * Romanized Bangla numbers are irregular, so we deliberately include only the
 * unambiguous, commonly-spoken words (1–10, a few tens, and the scales). Bangla
 * *script* digits (৫০০) are already converted upstream by normalize().
 */
interface ComposeResult {
    value: number;
    /** Whether a scale word (hundred/thousand/…) was part of the number. */
    hadScale: boolean;
}
/**
 * Parse the largest spelled-out number in the text. Splits on non-number words
 * so "five hundred on lunch with two friends" yields 500 (not 502). Returns
 * null when there are no number words.
 */
export declare function wordsToNumber(text: string): ComposeResult | null;
export {};
