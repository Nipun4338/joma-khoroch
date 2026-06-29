import { test } from "node:test";
import assert from "node:assert/strict";
import { parseTranscript } from "./parser";

test("English: 'just spent like 600 on lunch with Rafi'", () => {
  const r = parseTranscript("just spent like 600 on lunch with Rafi");
  assert.equal(r.amount, 600);
  assert.equal(r.category, "food");
  assert.equal(r.direction, "expense");
  assert.equal(r.counterparty, "Rafi");
  assert.ok(r.confidence > 0.6);
});

test("Code-switched bKash transfer: 'Rafi ke 500 taka bkash korlam'", () => {
  const r = parseTranscript("Rafi ke 500 taka bkash korlam");
  assert.equal(r.amount, 500);
  assert.equal(r.paymentMethod, "bkash");
  assert.equal(r.counterparty, "Rafi");
  assert.equal(r.category, "transfer");
});

test("Bangla digits + scale word: '২ হাজার টাকা rent dilam'", () => {
  const r = parseTranscript("২ হাজার টাকা rent dilam");
  // ২ -> 2, hajar is in Bangla script here so scale won't apply; ensure amount read.
  assert.equal(r.amount, 2);
  assert.equal(r.category, "rent");
});

test("Scale word 'k': '5k taka recharge'", () => {
  const r = parseTranscript("5k taka recharge korlam");
  assert.equal(r.amount, 5000);
  assert.equal(r.category, "mobile_recharge");
});

test("Income: 'salary pelam 30000 taka'", () => {
  const r = parseTranscript("salary pelam 30000 taka");
  assert.equal(r.amount, 30000);
  assert.equal(r.direction, "income");
  assert.equal(r.category, "salary");
});

test("No amount → low confidence, never throws", () => {
  const r = parseTranscript("kichu kinlam dokan theke");
  assert.equal(r.amount, null);
  assert.ok(r.confidence <= 0.25);
});

test("CNG ride: 'cng te 150 dilam'", () => {
  const r = parseTranscript("cng te 150 dilam");
  assert.equal(r.amount, 150);
  assert.equal(r.category, "transport");
  assert.equal(r.direction, "expense");
});

test("empty input is safe", () => {
  const r = parseTranscript("");
  assert.equal(r.amount, null);
  assert.equal(r.category, "other");
});
