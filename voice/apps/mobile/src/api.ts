import Constants from "expo-constants";
import type {
  CategoryTotal,
  CreateTransactionInput,
  ParsedTransaction,
  Transaction,
} from "@jk/shared";

const baseUrl: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${detail || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  /** Parse a transcript into an editable draft (no save). */
  parse: (transcript: string) =>
    request<ParsedTransaction>("/api/transactions/parse", {
      method: "POST",
      body: JSON.stringify({ transcript }),
    }),

  /** Persist a transaction (parse + apply edits server-side). */
  create: (input: CreateTransactionInput) =>
    request<Transaction>("/api/transactions", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  list: (limit = 50) => request<Transaction[]>(`/api/transactions?limit=${limit}`),

  statsByCategory: () =>
    request<CategoryTotal[]>("/api/stats/by-category"),
};
