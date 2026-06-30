/**
 * parseCommand: transcript → Command (intent + entities).
 *
 * Detection runs in a fixed precedence so overlapping keywords resolve
 * predictably:
 *   1. delete   — "delete/remove ..."
 *   2. set_limit — mentions a limit/target + an amount ("set daily limit to 1000")
 *   3. navigate — names a destination ("show insights", "go home")
 *   4. update   — "change/edit/recategorize ..."
 *   5. query    — "how much ...", "what's my balance"
 *   6. create   — falls through here if there's an amount (the capture path)
 *   7. unknown  — nothing recognized
 *
 * Supported edit/delete phrasings (deterministic, not free-form):
 *   delete:  "delete my last lunch", "remove the 600 taka one", "delete the last one"
 *   update:  "change that 600 to 700", "make the last one 450",
 *            "recategorize my last lunch as groceries"
 *   query:   "how much did I spend on food this week", "what's my balance"
 *   limit:   "set my daily limit to 1000", "monthly target 30000"
 *   nav:     "show insights", "go to dashboard"
 */
import type { Command } from "./types";
export declare function parseCommand(transcript: string): Command;
