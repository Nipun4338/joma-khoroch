import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { parseTranscript } from "@jk/shared";
import { insertTransaction, listTransactions, totalsByCategory } from "../repository";

export const router = Router();

/** Forward async handler rejections to Express's error middleware. */
const wrap =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

const parseBody = z.object({ transcript: z.string().min(1) });

/**
 * Preview only: parse a transcript into a draft transaction without saving.
 * The mobile app calls this to show an editable draft after transcription.
 */
router.post("/transactions/parse", (req, res) => {
  const body = parseBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.flatten() });
  res.json(parseTranscript(body.data.transcript));
});

const categoryEnum = z.enum([
  "food", "groceries", "transport", "rent", "bills", "mobile_recharge",
  "shopping", "health", "education", "entertainment", "transfer", "salary", "other",
]);

const overrideSchema = z
  .object({
    amount: z.number().positive().nullable(),
    direction: z.enum(["expense", "income"]),
    category: categoryEnum,
    counterparty: z.string().nullable(),
    paymentMethod: z
      .enum(["cash", "bkash", "nagad", "rocket", "card", "bank"])
      .nullable(),
    note: z.string(),
  })
  .partial();

const createBody = z.object({
  rawTranscript: z.string().min(1),
  override: overrideSchema.optional(),
  occurredAt: z.string().datetime().optional(),
});

/** Parse + apply any user edits + persist. Requires a final amount. */
router.post("/transactions", wrap(async (req, res) => {
  const body = createBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: body.error.flatten() });

  const draft = { ...parseTranscript(body.data.rawTranscript), ...body.data.override };
  if (draft.amount === null || draft.amount <= 0) {
    return res
      .status(422)
      .json({ error: "amount_required", draft, message: "Couldn't determine an amount; confirm it before saving." });
  }

  const saved = await insertTransaction(
    draft as typeof draft & { amount: number },
    body.data.occurredAt
  );
  res.status(201).json(saved);
}));

router.get("/transactions", wrap(async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 50) || 50, 200);
  res.json(await listTransactions(limit));
}));

router.get("/stats/by-category", wrap(async (req, res) => {
  const from = typeof req.query.from === "string" ? req.query.from : undefined;
  const to = typeof req.query.to === "string" ? req.query.to : undefined;
  res.json(await totalsByCategory(from, to));
}));
