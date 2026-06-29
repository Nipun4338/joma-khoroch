/**
 * Category classification via a bilingual keyword dictionary.
 *
 * This is intentionally a transparent lookup rather than an ML model: it's
 * fast, offline, debuggable, and easy for the user to extend. Keywords cover
 * English, romanized Bangla, and common Bangla script. When nothing matches we
 * return `other` with zero confidence so the UI can prompt.
 */
import type { Category } from "../types";
export interface CategoryResult {
    category: Category;
    confidence: number;
}
export declare function extractCategory(rawText: string): CategoryResult;
