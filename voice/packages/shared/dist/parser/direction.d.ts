/**
 * Direction detection: did money go out (expense) or come in (income)?
 *
 * Default is `expense` — the overwhelming majority of voice captures are
 * spending. We only flip to `income` on a clear inbound signal.
 */
import type { Direction } from "../types";
export declare function extractDirection(rawText: string): {
    direction: Direction;
    confidence: number;
};
