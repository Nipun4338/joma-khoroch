import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Card,
  Stack,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Chip,
  LinearProgress,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import axios from "axios";
import {
  parseTranscript,
  CATEGORIES,
  CATEGORY_LABELS,
  PAYMENT_METHODS,
} from "@jk/shared";

/**
 * Voice-first capture. Speak a transaction → parse to a structured draft →
 * confirm/edit → save through the existing /api/insertexpense pipeline.
 *
 * Parsing runs client-side (instant, offline). Speech recognition uses the
 * browser Web Speech API where available, and falls back to a text field on
 * browsers that lack it (notably iOS Safari) so the flow always works.
 */
export default function VoiceCapture({ getExpenselist }) {
  const recognitionRef = useRef(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState("en-US"); // en-US | bn-BD
  const [transcript, setTranscript] = useState("");
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const SR =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSupported(Boolean(SR));
  }, []);

  const startListening = () => {
    setError("");
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interim += t;
      }
      setTranscript((finalText + " " + interim).trim());
    };
    rec.onerror = (e) => {
      setError(`Mic error: ${e.error}. You can type it instead.`);
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      const text = finalText.trim();
      if (text) {
        setTranscript(text);
        setDraft(parseTranscript(text));
      }
    };

    recognitionRef.current = rec;
    setTranscript("");
    setDraft(null);
    setListening(true);
    rec.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const parseTyped = () => {
    const text = transcript.trim();
    if (text) setDraft(parseTranscript(text));
  };

  const updateDraft = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const save = async () => {
    if (!draft || !draft.amount) return;
    setSaving(true);
    setError("");
    try {
      const isIncome = draft.direction === "income";
      const label = CATEGORY_LABELS[draft.category] ?? "Other";
      const payload = {
        title: draft.counterparty ? `${label} · ${draft.counterparty}` : label,
        // Match the manual form: expenses are stored as a negative number.
        expense: isIncome ? draft.amount : -draft.amount,
        type: isIncome ? "add" : "remove",
        details: (draft.note || draft.rawTranscript || "Voice entry").trim(),
        category: draft.category,
      };
      await axios.post("/api/insertexpense", payload);
      setDraft(null);
      setTranscript("");
      await getExpenselist?.(false);
    } catch (e) {
      setError("Couldn't save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const confidencePct = useMemo(
    () => (draft ? Math.round(draft.confidence * 100) : 0),
    [draft]
  );
  const lowConfidence = draft && draft.confidence < 0.6;

  return (
    <Card sx={{ borderRadius: 4, p: 3, mb: 3, border: "1px solid #e2e8f0" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          🎤 Speak a transaction
        </Typography>
        <ToggleButtonGroup
          value={lang}
          exclusive
          size="small"
          onChange={(_, v) => v && setLang(v)}
        >
          <ToggleButton value="en-US">EN</ToggleButton>
          <ToggleButton value="bn-BD">বাংলা</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Capture surface */}
      {supported ? (
        <Stack alignItems="center" spacing={1.5} sx={{ py: 1 }}>
          <IconButton
            onClick={listening ? stopListening : startListening}
            sx={{
              width: 84,
              height: 84,
              bgcolor: listening ? "error.main" : "primary.main",
              color: "white",
              "&:hover": { bgcolor: listening ? "error.dark" : "primary.dark" },
              boxShadow: listening
                ? "0 0 0 8px rgba(239,68,68,0.18)"
                : "0 8px 24px rgba(99,102,241,0.35)",
              transition: "all 0.2s",
            }}
          >
            {listening ? (
              <StopIcon sx={{ fontSize: 40 }} />
            ) : (
              <MicIcon sx={{ fontSize: 40 }} />
            )}
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {listening ? "Listening… tap to stop" : "Tap and say what you spent"}
          </Typography>
          {transcript ? (
            <Typography sx={{ fontStyle: "italic", textAlign: "center" }}>
              “{transcript}”
            </Typography>
          ) : null}
        </Stack>
      ) : (
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Voice input isn’t supported in this browser — type what you’d say:
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. just spent 600 on lunch with Rafi"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && parseTyped()}
          />
          <Button onClick={parseTyped} variant="outlined" sx={{ alignSelf: "flex-start" }}>
            Parse
          </Button>
        </Stack>
      )}

      {error ? (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      ) : null}

      {/* Editable draft */}
      {draft ? (
        <Box sx={{ mt: 3, pt: 3, borderTop: "1px dashed #e2e8f0" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Review & save
            </Typography>
            <Chip
              size="small"
              label={`${lowConfidence ? "Check this" : "Looks good"} · ${confidencePct}%`}
              color={lowConfidence ? "warning" : "success"}
              variant={lowConfidence ? "filled" : "outlined"}
            />
          </Stack>

          <Stack spacing={2}>
            <TextField
              label="Amount (BDT)"
              type="number"
              size="small"
              fullWidth
              value={draft.amount ?? ""}
              onChange={(e) =>
                updateDraft({
                  amount: e.target.value ? Number(e.target.value) : null,
                })
              }
            />

            <ToggleButtonGroup
              value={draft.direction}
              exclusive
              size="small"
              fullWidth
              onChange={(_, v) => v && updateDraft({ direction: v })}
            >
              <ToggleButton value="expense">Expense</ToggleButton>
              <ToggleButton value="income">Income</ToggleButton>
            </ToggleButtonGroup>

            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Category"
                size="small"
                fullWidth
                value={draft.category}
                onChange={(e) => updateDraft({ category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Method"
                size="small"
                fullWidth
                value={draft.paymentMethod ?? ""}
                onChange={(e) =>
                  updateDraft({ paymentMethod: e.target.value || null })
                }
              >
                <MenuItem value="">—</MenuItem>
                {PAYMENT_METHODS.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TextField
              label="Who / where"
              size="small"
              fullWidth
              value={draft.counterparty ?? ""}
              onChange={(e) =>
                updateDraft({ counterparty: e.target.value || null })
              }
            />
            <TextField
              label="Note"
              size="small"
              fullWidth
              multiline
              value={draft.note}
              onChange={(e) => updateDraft({ note: e.target.value })}
            />

            {saving ? <LinearProgress /> : null}
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={() => setDraft(null)} disabled={saving}>
                Discard
              </Button>
              <Button
                onClick={save}
                variant="contained"
                disableElevation
                disabled={saving || !draft.amount}
                sx={{ px: 4, fontWeight: 800, borderRadius: 2 }}
              >
                Save Transaction
              </Button>
            </Stack>
          </Stack>
        </Box>
      ) : null}
    </Card>
  );
}
