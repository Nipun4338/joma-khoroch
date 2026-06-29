"use strict";
/**
 * Voice command intents. Sits in front of the capture parser: a transcript is
 * first classified into one of these, then the app routes it to an action.
 *
 * This is a deterministic grammar — it recognizes patterns, not arbitrary
 * phrasing. The supported shapes are documented per-intent in parse.ts and
 * surfaced to the user as example commands in the UI.
 */
Object.defineProperty(exports, "__esModule", { value: true });
