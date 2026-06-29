import type { Category, PaymentMethod } from "@jk/shared";

/** Taka with en-IN digit grouping (1,00,000), matching the web app's standard. */
export function formatTaka(amount: number): string {
  return `৳${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

const CATEGORY_LABELS: Record<Category, string> = {
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

export const categoryLabel = (c: Category): string => CATEGORY_LABELS[c] ?? c;

export const paymentLabel = (p: PaymentMethod): string =>
  p ? p.charAt(0).toUpperCase() + p.slice(1) : "—";
