# Joma Khoroch — Voice MVP

Voice-first capture for personal finance. You **say** a transaction
("just spent like 600 on lunch with Rafi") and it becomes a structured record —
amount, category, counterparty, payment method, note — no forms.

This is a **separate, self-contained monorepo** living alongside the existing
Next.js web app at the repo root. It does **not** touch or depend on the web
app, and it uses its **own database**. Nothing here was scaffolded over the
existing v2.0 web app.

## Layout

```
voice/
├─ packages/
│  └─ shared/        @jk/shared — domain types + the transcript parser (the core)
└─ apps/
   ├─ api/           @jk/api    — Express + PostgreSQL REST API
   └─ mobile/        @jk/mobile — Expo (React Native) app
```

The **parser** in `packages/shared` is the heart of the product and is fully
unit-tested with no device or network needed:

```bash
npm install
npm run test:shared
```

It's a deterministic, offline, heuristic parser (handles Bangla-English
code-switching, Bangla digits, taka/bKash/Nagad, local categories). It exposes
`parseTranscript(text): ParsedTransaction`. When accuracy demands it, swap that
one function's body for an LLM call returning the same shape — nothing else
changes.

## Open decision: transcription engine

Transcription is intentionally behind an interface
(`apps/mobile/src/transcription.ts`) so the choice never leaks into the app:

- **On-device** (`expo-speech-recognition`) — private, offline, free; weaker on
  heavy code-switching; needs a custom dev build (not Expo Go). Leans into the
  privacy selling point.
- **API** — accurate, paid per minute, sends audio off-device.

The MVP ships a `ManualTranscriber` (type the transcript) so the full
parse → confirm → save loop runs in **Expo Go today**, before committing to an
engine.

## Running it

### 1. API

```bash
cd apps/api
cp .env.example .env          # point DATABASE_URL at a fresh DB (NOT the web app's)
createdb joma_khoroch_voice   # or any Postgres you control
npm run db:setup              # applies schema.sql
npm run dev                   # http://localhost:4000
```

> PostGIS is **not** required — the MVP has no geo features. Enable it later via
> the commented lines in `apps/api/src/schema.sql` if you add location tagging.

### 2. Mobile

```bash
cd apps/mobile
# Physical phone? Set extra.apiBaseUrl in app.json to your machine's LAN IP.
npm run start                 # open in Expo Go
```

## API surface

| Method | Path                         | Purpose                                  |
| ------ | ---------------------------- | ---------------------------------------- |
| POST   | `/api/transactions/parse`    | Transcript → draft (no save)             |
| POST   | `/api/transactions`          | Parse + apply edits + persist            |
| GET    | `/api/transactions?limit=`   | Recent transactions                      |
| GET    | `/api/stats/by-category`     | Spend grouped by category                |
| GET    | `/health`                    | Liveness                                 |
```
