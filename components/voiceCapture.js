import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
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
  Alert,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import axios from "axios";
import {
  parseCommand,
  resolveTarget,
  runQuery,
  CATEGORIES,
  CATEGORY_LABELS,
  PAYMENT_METHODS,
} from "@jk/shared";

const EXAMPLES = [
  "spent 600 on lunch with Rafi",
  "delete my last lunch",
  "change that 600 to 700",
  "how much did I spend on food this week",
  "set daily limit to 1000",
  "show insights",
];

const taka = (n) => `৳${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

/** Map a raw `expenses` row to the shared ExpenseRecord shape. */
const toRecord = (r) => ({
  id: r.expense_id,
  title: r.expense_title ?? "",
  amount: Math.abs(Number(r.expense)),
  type: r.expense_type,
  category: r.category ?? null,
  details: r.expense_details ?? "",
  createdAt: new Date(r.created_date).toISOString(),
});

function speak(text) {
  try {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  } catch {}
}

/**
 * Voice command interface. A transcript is classified by parseCommand() into an
 * intent, then routed: create shows an editable draft; delete/edit ask for
 * confirmation against the resolved transaction; queries answer inline (and
 * aloud); set-limit confirms; navigate routes.
 */
export default function VoiceCapture({ getExpenselist, expenses = [], balance = 0 }) {
  const router = useRouter();
  const recognitionRef = useRef(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState("en-US");
  const [transcript, setTranscript] = useState("");
  const [command, setCommand] = useState(null);
  const [draft, setDraft] = useState(null); // editable copy for "create"
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }
  const [error, setError] = useState("");

  useEffect(() => {
    const SR =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSupported(Boolean(SR));
  }, []);

  const records = useMemo(() => (expenses || []).map(toRecord), [expenses]);

  // Best-match transaction for delete/update commands.
  const target = useMemo(() => {
    if (!command || (command.kind !== "delete" && command.kind !== "update")) return null;
    return resolveTarget(command.target, records)[0] ?? null;
  }, [command, records]);

  const reset = () => {
    setCommand(null);
    setDraft(null);
    setTranscript("");
  };

  const handleTranscript = (text) => {
    if (!text) return;
    const cmd = parseCommand(text);
    setError("");
    setMessage(null);

    // Intents that need no confirmation execute immediately.
    if (cmd.kind === "navigate") {
      setMessage({ type: "info", text: `Opening ${cmd.to}…` });
      router.push(cmd.to === "insights" ? "/insights" : "/");
      return;
    }
    if (cmd.kind === "query") {
      const answer =
        cmd.query.metric === "balance"
          ? `Your balance is ${taka(balance)}.`
          : runQuery(cmd.query, records).text;
      setMessage({ type: "success", text: answer });
      speak(answer);
      return;
    }

    setCommand(cmd);
    setDraft(cmd.kind === "create" ? cmd.draft : null);
  };

  // --- speech recognition ---
  const startListening = () => {
    setError("");
    setMessage(null);
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
        handleTranscript(text);
      }
    };

    recognitionRef.current = rec;
    setTranscript("");
    setCommand(null);
    setDraft(null);
    setListening(true);
    rec.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const parseTyped = () => handleTranscript(transcript.trim());

  // --- executors ---
  const updateDraft = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const saveCreate = async () => {
    if (!draft?.amount) return;
    setBusy(true);
    try {
      const isIncome = draft.direction === "income";
      const label = CATEGORY_LABELS[draft.category] ?? "Other";
      await axios.post("/api/insertexpense", {
        title: draft.counterparty ? `${label} · ${draft.counterparty}` : label,
        expense: isIncome ? draft.amount : -draft.amount,
        type: isIncome ? "add" : "remove",
        details: (draft.note || draft.rawTranscript || "Voice entry").trim(),
        category: draft.category,
      });
      setMessage({ type: "success", text: `Saved ${taka(draft.amount)} · ${label}` });
      reset();
      await getExpenselist?.(false);
    } catch {
      setError("Couldn't save. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!target) return;
    setBusy(true);
    try {
      await axios.post("/api/deleteexpense", { id: target.id });
      setMessage({ type: "success", text: `Deleted ${taka(target.amount)} · ${target.title}` });
      reset();
      await getExpenselist?.(false);
    } catch {
      setError("Couldn't delete. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const confirmUpdate = async () => {
    if (!target || !command || command.kind !== "update") return;
    const { changes } = command;
    setBusy(true);
    try {
      const newAmount = changes.amount ?? target.amount;
      const newType = changes.direction
        ? changes.direction === "income"
          ? "add"
          : "remove"
        : target.type;
      const newCategory = changes.category ?? target.category;
      await axios.post("/api/updateexpense", {
        id: target.id,
        expense: newType === "remove" ? -newAmount : newAmount,
        type: newType,
        category: newCategory,
      });
      setMessage({ type: "success", text: "Transaction updated." });
      reset();
      await getExpenselist?.(false);
    } catch {
      setError("Couldn't update. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const confirmSetLimit = async () => {
    if (!command || command.kind !== "set_limit") return;
    setBusy(true);
    try {
      if (command.which === "daily") {
        await axios.post("/api/updateDailyLimit", { dailyLimit: command.amount });
      } else {
        await axios.post("/api/updateMonthlyExpenseTarget", {
          monthlyExpenseTarget: command.amount,
        });
      }
      setMessage({
        type: "success",
        text: `${command.which === "daily" ? "Daily limit" : "Monthly target"} set to ${taka(command.amount)}.`,
      });
      reset();
    } catch {
      setError("Couldn't update the limit. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 4, p: 3, mb: 3, border: "1px solid #e2e8f0" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          🎤 Voice command
        </Typography>
        <ToggleButtonGroup value={lang} exclusive size="small" onChange={(_, v) => v && setLang(v)}>
          <ToggleButton value="en-US">EN</ToggleButton>
          <ToggleButton value="bn-BD">বাংলা</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Add, delete, edit, ask “how much…”, set limits, or navigate — by voice.
      </Typography>

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
            {listening ? <StopIcon sx={{ fontSize: 40 }} /> : <MicIcon sx={{ fontSize: 40 }} />}
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            {listening ? "Listening… tap to stop" : "Tap and speak a command"}
          </Typography>
          {transcript ? (
            <Typography sx={{ fontStyle: "italic", textAlign: "center" }}>“{transcript}”</Typography>
          ) : null}
        </Stack>
      ) : (
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Voice input isn’t supported in this browser — type a command:
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. delete my last lunch"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && parseTyped()}
          />
          <Button onClick={parseTyped} variant="outlined" sx={{ alignSelf: "flex-start" }}>
            Run
          </Button>
        </Stack>
      )}

      {/* Example commands */}
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
        {EXAMPLES.map((ex) => (
          <Chip
            key={ex}
            label={ex}
            size="small"
            variant="outlined"
            onClick={() => {
              setTranscript(ex);
              handleTranscript(ex);
            }}
          />
        ))}
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      ) : null}
      {message ? (
        <Alert severity={message.type} sx={{ mt: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      ) : null}

      {/* --- Intent-specific UI --- */}
      {command?.kind === "create" && draft ? (
        <CreateDraft
          draft={draft}
          busy={busy}
          onChange={updateDraft}
          onSave={saveCreate}
          onCancel={reset}
        />
      ) : null}

      {command?.kind === "delete" ? (
        <ConfirmPanel
          title="Delete this transaction?"
          danger
          record={target}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={reset}
          confirmLabel="Delete"
        />
      ) : null}

      {command?.kind === "update" ? (
        <ConfirmPanel
          title="Apply this change?"
          record={target}
          changes={command.changes}
          busy={busy}
          onConfirm={confirmUpdate}
          onCancel={reset}
          confirmLabel="Update"
        />
      ) : null}

      {command?.kind === "set_limit" ? (
        <Box sx={{ mt: 3, pt: 3, borderTop: "1px dashed #e2e8f0" }}>
          <Typography sx={{ mb: 2 }}>
            Set your <b>{command.which === "daily" ? "daily limit" : "monthly target"}</b> to{" "}
            <b>{taka(command.amount)}</b>?
          </Typography>
          {busy ? <LinearProgress sx={{ mb: 2 }} /> : null}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={reset} disabled={busy}>
              Cancel
            </Button>
            <Button variant="contained" disableElevation onClick={confirmSetLimit} disabled={busy}>
              Set
            </Button>
          </Stack>
        </Box>
      ) : null}

      {command?.kind === "unknown" ? (
        <Alert severity="warning" sx={{ mt: 2 }} onClose={reset}>
          Didn’t catch that. Try one of the examples above.
        </Alert>
      ) : null}
    </Card>
  );
}

/** Confirmation panel for delete/update, showing the resolved transaction. */
function ConfirmPanel({ title, record, changes, danger, busy, onConfirm, onCancel, confirmLabel }) {
  if (!record) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }} onClose={onCancel}>
        Couldn’t find a matching transaction. Try naming the amount or category.
      </Alert>
    );
  }
  return (
    <Box sx={{ mt: 3, pt: 3, borderTop: "1px dashed #e2e8f0" }}>
      <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{title}</Typography>
      <Card variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography sx={{ fontWeight: 600 }}>{record.title}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {record.details}
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 700, color: record.type === "add" ? "success.main" : "error.main" }}>
            {record.type === "add" ? "+" : "−"}
            {taka(record.amount)}
          </Typography>
        </Stack>
        {changes && (changes.amount !== undefined || changes.category !== undefined) ? (
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid #eef2f7" }}>
            <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
              → {changes.amount !== undefined ? `Amount: ${taka(changes.amount)}` : ""}
              {changes.amount !== undefined && changes.category !== undefined ? " · " : ""}
              {changes.category !== undefined ? `Category: ${CATEGORY_LABELS[changes.category]}` : ""}
            </Typography>
          </Box>
        ) : null}
      </Card>
      {busy ? <LinearProgress sx={{ mb: 2 }} /> : null}
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color={danger ? "error" : "primary"}
          disableElevation
          onClick={onConfirm}
          disabled={busy}
          sx={{ px: 3, fontWeight: 800, borderRadius: 2 }}
        >
          {confirmLabel}
        </Button>
      </Stack>
    </Box>
  );
}

/** Editable draft for the create intent. */
function CreateDraft({ draft, busy, onChange, onSave, onCancel }) {
  const low = draft.confidence < 0.6;
  return (
    <Box sx={{ mt: 3, pt: 3, borderTop: "1px dashed #e2e8f0" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Review & save
        </Typography>
        <Chip
          size="small"
          label={`${low ? "Check this" : "Looks good"} · ${Math.round(draft.confidence * 100)}%`}
          color={low ? "warning" : "success"}
          variant={low ? "filled" : "outlined"}
        />
      </Stack>
      <Stack spacing={2}>
        <TextField
          label="Amount (BDT)"
          type="number"
          size="small"
          fullWidth
          value={draft.amount ?? ""}
          onChange={(e) => onChange({ amount: e.target.value ? Number(e.target.value) : null })}
        />
        <ToggleButtonGroup
          value={draft.direction}
          exclusive
          size="small"
          fullWidth
          onChange={(_, v) => v && onChange({ direction: v })}
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
            onChange={(e) => onChange({ category: e.target.value })}
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
            onChange={(e) => onChange({ paymentMethod: e.target.value || null })}
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
          onChange={(e) => onChange({ counterparty: e.target.value || null })}
        />
        <TextField
          label="Note"
          size="small"
          fullWidth
          multiline
          value={draft.note}
          onChange={(e) => onChange({ note: e.target.value })}
        />
        {busy ? <LinearProgress /> : null}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onCancel} disabled={busy}>
            Discard
          </Button>
          <Button
            onClick={onSave}
            variant="contained"
            disableElevation
            disabled={busy || !draft.amount}
            sx={{ px: 4, fontWeight: 800, borderRadius: 2 }}
          >
            Save Transaction
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
