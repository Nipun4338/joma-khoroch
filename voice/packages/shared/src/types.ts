/**
 * Core domain types shared across the API and the mobile app.
 *
 * The whole product hinges on turning a spoken sentence into one of these.
 * Keep this file as the single source of truth — both ends import from here.
 */

/** Whether money left the wallet (expense) or came in (income). */
export type Direction = "expense" | "income";

/**
 * Local-first category set. Tuned for everyday Bangladesh spending rather than
 * a generic Western budget app. `other` is the safe fallback when the parser
 * isn't confident.
 */
export type Category =
  | "food"
  | "groceries"
  | "transport"
  | "rent"
  | "bills"
  | "mobile_recharge"
  | "shopping"
  | "health"
  | "education"
  | "entertainment"
  | "transfer"
  | "salary"
  | "other";

/** How the money moved. bKash/Nagad/Rocket are the dominant local rails. */
export type PaymentMethod =
  | "cash"
  | "bkash"
  | "nagad"
  | "rocket"
  | "card"
  | "bank"
  | null;

/**
 * The structured result of parsing a transcript. Every field except `amount`
 * and `rawTranscript` may be null/uncertain — the UI is expected to show this
 * as an editable draft, not a committed record.
 */
export interface ParsedTransaction {
  /** Amount in BDT (Taka). Always positive; `direction` carries the sign. */
  amount: number | null;
  direction: Direction;
  category: Category;
  /** Person or merchant the money moved to/from, e.g. "Rafi". */
  counterparty: string | null;
  paymentMethod: PaymentMethod;
  /** A short human note — for v1 this is the cleaned transcript. */
  note: string;
  /** The verbatim transcript we parsed, kept for audit + re-parsing later. */
  rawTranscript: string;
  /**
   * 0..1 rough confidence that we got the amount + category right. Drives
   * whether the UI auto-saves or asks the user to confirm.
   */
  confidence: number;
}

/** A transaction as persisted by the API (parsed draft + identity/timestamps). */
export interface Transaction extends ParsedTransaction {
  id: string;
  /** When the money was spent (defaults to capture time). ISO 8601. */
  occurredAt: string;
  createdAt: string;
}

/** Payload the mobile app sends to create a transaction from a transcript. */
export interface CreateTransactionInput {
  rawTranscript: string;
  /** Optional client-side override of the parsed draft before saving. */
  override?: Partial<ParsedTransaction>;
  occurredAt?: string;
}

/** One bucket in a spend-by-category breakdown. */
export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
}

/** Runtime list of all categories (single source for UI dropdowns). */
export const CATEGORIES: Category[] = [
  "food", "groceries", "transport", "rent", "bills", "mobile_recharge",
  "shopping", "health", "education", "entertainment", "transfer", "salary", "other",
];

/** Human-readable labels, e.g. for select menus. */
export const CATEGORY_LABELS: Record<Category, string> = {
  food: "Food",
  groceries: "Groceries",
  transport: "Transport",
  rent: "Rent",
  bills: "Bills",
  mobile_recharge: "Mobile/Recharge",
  shopping: "Shopping",
  health: "Health",
  education: "Education",
  entertainment: "Entertainment",
  transfer: "Transfer",
  salary: "Salary",
  other: "Other",
};

/** Runtime list of selectable payment methods (excludes null). */
export const PAYMENT_METHODS: Exclude<PaymentMethod, null>[] = [
  "cash", "bkash", "nagad", "rocket", "card", "bank",
];
