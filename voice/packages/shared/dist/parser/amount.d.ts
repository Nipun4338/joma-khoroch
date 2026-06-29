/**
 * Amount extraction.
 *
 * Handles digit amounts with optional scale words in both languages:
 *   "600", "5k", "5 hazar", "dui hajar" (digits only for now), "1.5 lakh".
 * Pure word-numbers ("panch sho" = 500 spelled out) are out of scope for v1 —
 * see the parser README for the LLM upgrade path.
 */
export interface AmountResult {
    amount: number | null;
    confidence: number;
}
export declare function extractAmount(rawText: string): AmountResult;
