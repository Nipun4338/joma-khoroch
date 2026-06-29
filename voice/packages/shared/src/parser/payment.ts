/**
 * Payment-method detection. bKash / Nagad / Rocket are the dominant mobile
 * financial services in Bangladesh, so they get first-class keywords.
 */

import type { PaymentMethod } from "../types";
import { normalize } from "./normalize";

const RULES: Array<{ method: Exclude<PaymentMethod, null>; words: string[] }> = [
  { method: "bkash", words: ["bkash", "bikash", "bekash", "বিকাশ"] },
  { method: "nagad", words: ["nagad", "nogod", "নগদ"] },
  { method: "rocket", words: ["rocket", "রকেট"] },
  { method: "card", words: ["card", "debit", "credit", "visa", "mastercard"] },
  { method: "bank", words: ["bank", "neft", "rtgs", "cheque", "check transfer"] },
  { method: "cash", words: ["cash", "nogod taka", "hate", "hate hate", "khuchra"] },
];

export function extractPaymentMethod(rawText: string): PaymentMethod {
  const text = normalize(rawText);
  for (const rule of RULES) {
    if (rule.words.some((w) => text.includes(w))) return rule.method;
  }
  return null;
}
