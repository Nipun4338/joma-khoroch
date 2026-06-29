import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import type { CategoryTotal, ParsedTransaction, Transaction } from "@jk/shared";
import { api } from "./src/api";
import { categoryLabel, formatTaka, paymentLabel } from "./src/format";
import { defaultTranscriber } from "./src/transcription";

const EXAMPLES = [
  "just spent like 600 on lunch with Rafi",
  "Rafi ke 500 taka bkash korlam",
  "cng te 150 dilam",
  "salary pelam 30000 taka",
];

export default function App() {
  const [tab, setTab] = useState<"capture" | "history">("capture");

  return (
    <View style={styles.app}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.brand}>Joma Khoroch · Voice</Text>
        <Text style={styles.tagline}>Say it. We'll sort it.</Text>
      </View>

      <View style={styles.tabs}>
        <TabButton label="Capture" active={tab === "capture"} onPress={() => setTab("capture")} />
        <TabButton label="History" active={tab === "history"} onPress={() => setTab("history")} />
      </View>

      {tab === "capture" ? <CaptureScreen /> : <HistoryScreen />}
    </View>
  );
}

function TabButton(props: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={props.onPress} style={[styles.tab, props.active && styles.tabActive]}>
      <Text style={[styles.tabText, props.active && styles.tabTextActive]}>{props.label}</Text>
    </Pressable>
  );
}

function CaptureScreen() {
  const [transcript, setTranscript] = useState("");
  const [draft, setDraft] = useState<ParsedTransaction | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const parse = useCallback(async () => {
    if (!transcript.trim()) return;
    setBusy(true);
    setSaved(null);
    try {
      setDraft(await api.parse(transcript.trim()));
    } catch (e) {
      setDraft(null);
      setSaved(`Couldn't reach the API. ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }, [transcript]);

  const save = useCallback(async () => {
    if (!draft) return;
    setBusy(true);
    try {
      const tx = await api.create({ rawTranscript: draft.rawTranscript, override: draft });
      setSaved(`Saved ${formatTaka(tx.amount ?? 0)} · ${categoryLabel(tx.category)}`);
      setDraft(null);
      setTranscript("");
    } catch (e) {
      setSaved(`Save failed. ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }, [draft]);

  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      {/* In Expo Go there's no live mic, so we collect the transcript as text.
          Wire defaultTranscriber to a live engine to replace this input. */}
      <Text style={styles.label}>
        {defaultTranscriber.isLive ? "Tap to speak" : "What did you say?"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. just spent 600 on lunch with Rafi"
        placeholderTextColor="#6B7280"
        value={transcript}
        onChangeText={setTranscript}
        multiline
      />

      <View style={styles.chips}>
        {EXAMPLES.map((ex) => (
          <Pressable key={ex} style={styles.chip} onPress={() => setTranscript(ex)}>
            <Text style={styles.chipText}>{ex}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={[styles.primary, busy && styles.disabled]} onPress={parse} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Parse</Text>}
      </Pressable>

      {draft && <DraftCard draft={draft} onChange={setDraft} onSave={save} busy={busy} />}
      {saved && <Text style={styles.saved}>{saved}</Text>}
    </ScrollView>
  );
}

function DraftCard(props: {
  draft: ParsedTransaction;
  onChange: (d: ParsedTransaction) => void;
  onSave: () => void;
  busy: boolean;
}) {
  const { draft } = props;
  const low = draft.confidence < 0.6;

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Amount (৳)</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="numeric"
          value={draft.amount?.toString() ?? ""}
          onChangeText={(t) =>
            props.onChange({ ...draft, amount: t ? Number(t.replace(/[^\d.]/g, "")) : null })
          }
          placeholder="—"
          placeholderTextColor="#6B7280"
        />
      </View>

      <Meta label="Category" value={categoryLabel(draft.category)} />
      <Meta label="Direction" value={draft.direction} />
      <Meta label="Who/Where" value={draft.counterparty ?? "—"} />
      <Meta label="Method" value={paymentLabel(draft.paymentMethod)} />

      <View style={styles.confRow}>
        <View style={[styles.confDot, { backgroundColor: low ? "#F59E0B" : "#10B981" }]} />
        <Text style={styles.confText}>
          {low ? "Low confidence — check before saving" : "Looks good"} ·{" "}
          {Math.round(draft.confidence * 100)}%
        </Text>
      </View>

      <Pressable
        style={[styles.primary, (props.busy || !draft.amount) && styles.disabled]}
        onPress={props.onSave}
        disabled={props.busy || !draft.amount}
      >
        <Text style={styles.primaryText}>Save transaction</Text>
      </Pressable>
    </View>
  );
}

function Meta(props: { label: string; value: string }) {
  return (
    <View style={styles.cardRow}>
      <Text style={styles.cardLabel}>{props.label}</Text>
      <Text style={styles.cardValue}>{props.value}</Text>
    </View>
  );
}

function HistoryScreen() {
  const [items, setItems] = useState<Transaction[] | null>(null);
  const [totals, setTotals] = useState<CategoryTotal[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [list, byCat] = await Promise.all([api.list(), api.statsByCategory()]);
        setItems(list);
        setTotals(byCat);
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, []);

  if (error) return <Text style={styles.saved}>Couldn't load: {error}</Text>;
  if (!items) return <ActivityIndicator style={{ marginTop: 40 }} color="#10B981" />;

  const max = Math.max(1, ...totals.map((t) => t.total));

  return (
    <ScrollView contentContainerStyle={styles.body}>
      {totals.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spend by category</Text>
          {totals.map((t) => (
            <View key={t.category} style={styles.barRow}>
              <Text style={styles.barLabel}>{categoryLabel(t.category)}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${(t.total / max) * 100}%` }]} />
              </View>
              <Text style={styles.barValue}>{formatTaka(t.total)}</Text>
            </View>
          ))}
        </View>
      )}

      {items.length === 0 && <Text style={styles.empty}>No transactions yet. Capture one!</Text>}
      {items.map((tx) => (
        <View key={tx.id} style={styles.txRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.txTitle}>
              {categoryLabel(tx.category)}
              {tx.counterparty ? ` · ${tx.counterparty}` : ""}
            </Text>
            <Text style={styles.txNote} numberOfLines={1}>
              {tx.note}
            </Text>
          </View>
          <Text style={[styles.txAmount, tx.direction === "income" && styles.income]}>
            {tx.direction === "income" ? "+" : "−"}
            {formatTaka(tx.amount ?? 0)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#0B1020" },
  header: { paddingTop: 64, paddingHorizontal: 20, paddingBottom: 12 },
  brand: { color: "#fff", fontSize: 22, fontWeight: "700" },
  tagline: { color: "#9CA3AF", marginTop: 2 },
  tabs: { flexDirection: "row", paddingHorizontal: 20, gap: 8, marginBottom: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: "#1A2236" },
  tabActive: { backgroundColor: "#10B981" },
  tabText: { color: "#9CA3AF", fontWeight: "600" },
  tabTextActive: { color: "#04130D" },
  body: { padding: 20, gap: 14 },
  label: { color: "#9CA3AF", fontWeight: "600" },
  input: {
    backgroundColor: "#141C2E",
    color: "#fff",
    borderRadius: 14,
    padding: 16,
    minHeight: 84,
    fontSize: 16,
    textAlignVertical: "top",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#141C2E", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  chipText: { color: "#9CA3AF", fontSize: 12 },
  primary: {
    backgroundColor: "#10B981",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  primaryText: { color: "#04130D", fontWeight: "700", fontSize: 16 },
  disabled: { opacity: 0.5 },
  saved: { color: "#10B981", textAlign: "center", marginTop: 4 },
  card: { backgroundColor: "#141C2E", borderRadius: 16, padding: 16, gap: 10 },
  cardTitle: { color: "#fff", fontWeight: "700", fontSize: 16, marginBottom: 4 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardLabel: { color: "#9CA3AF" },
  cardValue: { color: "#fff", fontWeight: "600", textTransform: "capitalize" },
  amountInput: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    minWidth: 120,
    textAlign: "right",
    paddingVertical: 4,
  },
  confRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  confDot: { width: 10, height: 10, borderRadius: 5 },
  confText: { color: "#9CA3AF", fontSize: 12 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barLabel: { color: "#cbd5e1", width: 96, fontSize: 12 },
  barTrack: { flex: 1, height: 10, backgroundColor: "#0B1020", borderRadius: 5, overflow: "hidden" },
  barFill: { height: 10, backgroundColor: "#10B981" },
  barValue: { color: "#fff", width: 80, textAlign: "right", fontSize: 12 },
  empty: { color: "#6B7280", textAlign: "center", marginTop: 20 },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141C2E",
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  txTitle: { color: "#fff", fontWeight: "600" },
  txNote: { color: "#6B7280", fontSize: 12, marginTop: 2 },
  txAmount: { color: "#F87171", fontWeight: "700" },
  income: { color: "#10B981" },
});
