import type { CategoryTotal, ParsedTransaction, Transaction } from "@jk/shared";
import { query } from "./db";

/** DB row → API Transaction (snake_case → camelCase, numeric coercion). */
interface Row {
  id: string;
  amount: string;
  direction: "expense" | "income";
  category: string;
  counterparty: string | null;
  payment_method: string | null;
  note: string;
  raw_transcript: string;
  confidence: number;
  occurred_at: Date;
  created_at: Date;
}

function toTransaction(r: Row): Transaction {
  return {
    id: r.id,
    amount: Number(r.amount),
    direction: r.direction,
    category: r.category as Transaction["category"],
    counterparty: r.counterparty,
    paymentMethod: r.payment_method as Transaction["paymentMethod"],
    note: r.note,
    rawTranscript: r.raw_transcript,
    confidence: r.confidence,
    occurredAt: r.occurred_at.toISOString(),
    createdAt: r.created_at.toISOString(),
  };
}

export async function insertTransaction(
  draft: ParsedTransaction & { amount: number },
  occurredAt?: string
): Promise<Transaction> {
  const rows = await query<Row>(
    `INSERT INTO transactions
       (amount, direction, category, counterparty, payment_method, note, raw_transcript, confidence, occurred_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, now()))
     RETURNING *`,
    [
      draft.amount,
      draft.direction,
      draft.category,
      draft.counterparty,
      draft.paymentMethod,
      draft.note,
      draft.rawTranscript,
      draft.confidence,
      occurredAt ?? null,
    ]
  );
  return toTransaction(rows[0]);
}

export async function listTransactions(limit = 50): Promise<Transaction[]> {
  const rows = await query<Row>(
    `SELECT * FROM transactions ORDER BY occurred_at DESC LIMIT $1`,
    [limit]
  );
  return rows.map(toTransaction);
}

export async function totalsByCategory(
  from?: string,
  to?: string
): Promise<CategoryTotal[]> {
  const rows = await query<{ category: string; total: string; count: string }>(
    `SELECT category, SUM(amount) AS total, COUNT(*) AS count
       FROM transactions
      WHERE direction = 'expense'
        AND ($1::timestamptz IS NULL OR occurred_at >= $1)
        AND ($2::timestamptz IS NULL OR occurred_at <  $2)
      GROUP BY category
      ORDER BY total DESC`,
    [from ?? null, to ?? null]
  );
  return rows.map((r) => ({
    category: r.category as CategoryTotal["category"],
    total: Number(r.total),
    count: Number(r.count),
  }));
}
