"use strict";
/**
 * Category classification via a bilingual keyword dictionary.
 *
 * This is intentionally a transparent lookup rather than an ML model: it's
 * fast, offline, debuggable, and easy for the user to extend. Keywords cover
 * English, romanized Bangla, and common Bangla script. When nothing matches we
 * return `other` with zero confidence so the UI can prompt.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCategory = extractCategory;
const normalize_1 = require("./normalize");
/** category → trigger words/phrases (all lowercase, matched as substrings/words). */
const KEYWORDS = {
    food: [
        "lunch", "dinner", "breakfast", "khabar", "khawa", "khelam", "restaurant",
        "hotel", "cafe", "coffee", "cha", "tea", "snacks", "biryani", "fast food",
        "dupure khabar", "rater khabar", "nasta", "খাবার", "খাওয়া",
    ],
    groceries: [
        "grocery", "groceries", "bazar", "bazaar", "vegetables", "sobji", "shobji",
        "rice", "chal", "dal", "mudi", "kacha bazar", "বাজার",
    ],
    transport: [
        "uber", "pathao", "cng", "rickshaw", "riksha", "bus", "train", "bhara",
        "vara", "fuel", "petrol", "gas", "taxi", "ride", "transport", "রিকশা",
    ],
    rent: ["rent", "bari vara", "basa vara", "house rent", "flat", "vara baki", "ভাড়া"],
    bills: [
        "bill", "electricity", "current bill", "wasa", "water bill", "gas bill",
        "internet", "wifi", "dish", "utility", "বিল",
    ],
    mobile_recharge: [
        "recharge", "flexiload", "flexi", "topup", "top up", "minute", "mb",
        "data pack", "gp", "robi", "banglalink", "airtel", "teletalk", "রিচার্জ",
    ],
    shopping: [
        "shopping", "shirt", "pant", "jutা", "juta", "shoe", "dress", "panjabi",
        "saree", "shari", "clothes", "kapor", "gift", "daraz", "online order",
    ],
    health: [
        "doctor", "medicine", "ousud", "oushod", "pharmacy", "hospital", "clinic",
        "test", "checkup", "ডাক্তার", "ঔষধ",
    ],
    education: [
        "tuition", "coaching", "books", "boi", "exam fee", "admission", "course",
        "school", "college", "university", "fees", "বেতন",
    ],
    entertainment: [
        "movie", "cinema", "ticket", "concert", "game", "netflix", "subscription",
        "ghora", "ghurte", "outing", "park",
    ],
    transfer: [
        "send money", "cash out", "cashout", "transfer", "pathalam", "dilam taka",
        "bkash korlam", "nagad korlam", "tk pathai", "send korlam",
    ],
    salary: ["salary", "beton", "income", "pelam", "peyechi", "received", "bonus", "বেতন পেলাম"],
};
function extractCategory(rawText) {
    const text = (0, normalize_1.normalize)(rawText);
    // Whole-word token set so short keywords like "cha" (tea) don't match inside
    // longer words like "recharge". Splits on anything that isn't a letter/digit,
    // which keeps Bangla-script words (\p{L}) intact as single tokens.
    const wordSet = new Set(text.split(/[^\p{L}\p{N}]+/u).filter(Boolean));
    let best = { category: "other", score: 0 };
    for (const [cat, words] of Object.entries(KEYWORDS)) {
        let score = 0;
        for (const w of words) {
            if (w.includes(" ")) {
                // Multi-word phrases are strong, distinctive signals; substring is fine.
                if (text.includes(w))
                    score += 2;
            }
            else if (wordSet.has(w)) {
                score += 1;
            }
        }
        if (score > best.score)
            best = { category: cat, score };
    }
    if (best.score === 0)
        return { category: "other", confidence: 0 };
    // Map raw score to a soft confidence; cap so a single keyword isn't "certain".
    const confidence = Math.min(0.9, 0.55 + best.score * 0.12);
    return { category: best.category, confidence };
}
