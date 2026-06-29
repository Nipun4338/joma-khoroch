/**
 * Text normalization shared by every parser stage.
 *
 * Bangladeshi voice input is heavily code-switched: a single sentence can mix
 * English words, Bangla words, Latin digits and Bangla digits. We flatten all
 * of that to a predictable lowercase ASCII-digit string before matching.
 */
/** Convert any Bangla digits in the string to ASCII digits. */
export declare function banglaDigitsToAscii(text: string): string;
/**
 * Lowercase, convert Bangla digits, and collapse whitespace. Punctuation is
 * kept (we strip it per-stage where needed) so counterparty names survive.
 */
export declare function normalize(text: string): string;
/** Tokenize on whitespace after normalizing. */
export declare function tokens(text: string): string[];
