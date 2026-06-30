import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCommand } from "./command/parse";
import { resolveTarget, runQuery } from "./command/resolve";

// --- intent classification ---

test("create still routes through (has amount, no command verb)", () => {
  const c = parseCommand("just spent 600 on lunch with Rafi");
  assert.equal(c.kind, "create");
  if (c.kind === "create") assert.equal(c.draft.amount, 600);
});

test("delete: 'delete my last lunch'", () => {
  const c = parseCommand("delete my last lunch");
  assert.equal(c.kind, "delete");
  if (c.kind === "delete") {
    assert.equal(c.target.ordinal, "last");
    assert.equal(c.target.category, "food");
  }
});

test("delete by amount: 'remove the 600 taka one'", () => {
  const c = parseCommand("remove the 600 taka one");
  assert.equal(c.kind, "delete");
  if (c.kind === "delete") assert.equal(c.target.amount, 600);
});

test("update amount: 'change that 600 to 700'", () => {
  const c = parseCommand("change that 600 to 700");
  assert.equal(c.kind, "update");
  if (c.kind === "update") {
    assert.equal(c.changes.amount, 700);
    assert.equal(c.target.amount, 600);
  }
});

test("update category: 'recategorize my last lunch as groceries'", () => {
  const c = parseCommand("recategorize my last lunch as groceries");
  assert.equal(c.kind, "update");
  if (c.kind === "update") {
    assert.equal(c.changes.category, "groceries");
    assert.equal(c.target.ordinal, "last");
    assert.equal(c.target.category, "food");
  }
});

test("set_limit daily: 'set my daily limit to 1000'", () => {
  const c = parseCommand("set my daily limit to 1000");
  assert.equal(c.kind, "set_limit");
  if (c.kind === "set_limit") {
    assert.equal(c.which, "daily");
    assert.equal(c.amount, 1000);
  }
});

test("set_limit monthly: 'monthly target 30000'", () => {
  const c = parseCommand("monthly target 30000");
  assert.equal(c.kind, "set_limit");
  if (c.kind === "set_limit") {
    assert.equal(c.which, "monthly");
    assert.equal(c.amount, 30000);
  }
});

test("query total: 'how much did I spend on food this week'", () => {
  const c = parseCommand("how much did I spend on food this week");
  assert.equal(c.kind, "query");
  if (c.kind === "query") {
    assert.equal(c.query.metric, "total_spend");
    assert.equal(c.query.category, "food");
    assert.equal(c.query.period, "week");
  }
});

test("query balance: \"what's my balance\"", () => {
  const c = parseCommand("what's my balance");
  assert.equal(c.kind, "query");
  if (c.kind === "query") assert.equal(c.query.metric, "balance");
});

test("navigate: 'show insights'", () => {
  const c = parseCommand("show insights");
  assert.equal(c.kind, "navigate");
  if (c.kind === "navigate") assert.equal(c.to, "insights");
});

test("unknown: gibberish with no amount or verb", () => {
  assert.equal(parseCommand("hello there").kind, "unknown");
});

// --- resolution + query over records ---

const records = [
  { id: 1, title: "Food · Rafi", amount: 600, type: "remove", category: "food", details: "lunch with rafi", createdAt: "2026-06-29T12:00:00Z" },
  { id: 2, title: "Transport", amount: 150, type: "remove", category: "transport", details: "cng", createdAt: "2026-06-29T09:00:00Z" },
  { id: 3, title: "Food", amount: 250, type: "remove", category: "food", details: "snacks", createdAt: "2026-06-28T18:00:00Z" },
  { id: 4, title: "Salary", amount: 30000, type: "add", category: "salary", details: "june", createdAt: "2026-06-25T10:00:00Z" },
] as const;

test("resolveTarget: last food → most recent food row", () => {
  const c = parseCommand("delete my last food");
  assert.equal(c.kind, "delete");
  if (c.kind !== "delete") return;
  const hits = resolveTarget(c.target, records as any);
  assert.equal(hits[0].id, 1); // 600 lunch, newest food
  assert.equal(hits.length, 2);
});

test("resolveTarget: by amount 250 → the snacks row", () => {
  const hits = resolveTarget(
    { ordinal: null, category: null, counterparty: null, amount: 250 },
    records as any
  );
  assert.equal(hits[0].id, 3);
});

test("runQuery: total food spend (all) = 850", () => {
  const r = runQuery(
    { metric: "total_spend", category: "food", period: "all" },
    records as any
  );
  assert.equal(r.total, 850);
  assert.equal(r.count, 2);
});

test("runQuery: income excluded from spend totals", () => {
  const r = runQuery(
    { metric: "total_spend", category: null, period: "all" },
    records as any
  );
  assert.equal(r.total, 1000); // 600 + 150 + 250, NOT the 30000 salary
});
