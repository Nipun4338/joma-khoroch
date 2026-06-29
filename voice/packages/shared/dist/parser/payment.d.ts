/**
 * Payment-method detection. bKash / Nagad / Rocket are the dominant mobile
 * financial services in Bangladesh, so they get first-class keywords.
 */
import type { PaymentMethod } from "../types";
export declare function extractPaymentMethod(rawText: string): PaymentMethod;
