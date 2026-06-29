"use strict";
/**
 * Core domain types shared across the API and the mobile app.
 *
 * The whole product hinges on turning a spoken sentence into one of these.
 * Keep this file as the single source of truth — both ends import from here.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_METHODS = exports.CATEGORY_LABELS = exports.CATEGORIES = void 0;
/** Runtime list of all categories (single source for UI dropdowns). */
exports.CATEGORIES = [
    "food", "groceries", "transport", "rent", "bills", "mobile_recharge",
    "shopping", "health", "education", "entertainment", "transfer", "salary", "other",
];
/** Human-readable labels, e.g. for select menus. */
exports.CATEGORY_LABELS = {
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
exports.PAYMENT_METHODS = [
    "cash", "bkash", "nagad", "rocket", "card", "bank",
];
