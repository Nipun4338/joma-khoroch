/**
 * Transcription is deliberately behind an interface so the on-device vs. API
 * decision stays a one-file swap and never leaks into the rest of the app.
 *
 * The parser downstream only cares about a string, so whichever engine we pick,
 * the contract is the same: start listening, get back a transcript.
 *
 * MVP default (this file): ManualTranscriber — the user types/pastes what they
 * "said". It needs no native modules, so it runs in Expo Go today and lets us
 * exercise the whole parse → confirm → save flow before committing to an engine.
 *
 * To go real (pick one, implement `Transcriber`, swap `defaultTranscriber`):
 *   • On-device (private, offline, free): `expo-speech-recognition`
 *     (or @react-native-voice/voice). Requires a custom dev build, not Expo Go.
 *     Best for the privacy story; weaker on heavy Bangla-English code-switching.
 *   • API (accurate, paid, sends audio off-device): stream to a speech API.
 *     Revisit only if on-device accuracy proves unusable on real captures.
 */

export interface TranscriptionResult {
  transcript: string;
  /** Engine-reported confidence if available (0..1), else undefined. */
  confidence?: number;
}

export interface Transcriber {
  readonly id: string;
  /** True only when the engine can actually capture audio on this build. */
  readonly isLive: boolean;
}

/**
 * Placeholder engine for Expo Go: there's no live audio, so the UI collects the
 * text itself. Kept as a class so swapping in a live engine is symmetric.
 */
export class ManualTranscriber implements Transcriber {
  readonly id = "manual";
  readonly isLive = false;
}

export const defaultTranscriber: Transcriber = new ManualTranscriber();
