/**
 * Counterparty (person or merchant) extraction.
 *
 * Two grammars to cover code-switching:
 *   English: "<verb> ... with/to/from <Name>"   → "lunch with Rafi"
 *   Bangla:  "<Name> ke/re ..."                 → "Rafi ke 500 dilam"
 *
 * On-device transcribers often emit lowercase text, so we can't rely on
 * capitalization to spot names — instead we take the token next to a relation
 * word and reject it if it's a known stop/category word.
 */
export interface CounterpartyResult {
    counterparty: string | null;
    confidence: number;
}
export declare function extractCounterparty(rawText: string): CounterpartyResult;
