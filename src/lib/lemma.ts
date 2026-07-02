// Server-side Lemma integration.
// Talks straight to the Lemma REST API with a Bearer token, so app users
// never have to log into Lemma themselves. Every completed quiz round is
// persisted into a `study_rounds` table in the pod.

const API_URL = process.env.LEMMA_API_URL || "https://api.lemma.work";
const POD_ID = process.env.LEMMA_POD_ID;
const TOKEN = process.env.LEMMA_TOKEN;

const TABLE = "study_rounds";

export function lemmaConfigured() {
  return Boolean(POD_ID && TOKEN);
}

async function lemmaFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Lemma ${init.method ?? "GET"} ${path} → ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.status === 204 ? null : res.json();
}

let tableEnsured = false;

async function ensureTable() {
  if (tableEnsured) return;
  try {
    await lemmaFetch(`/pods/${POD_ID}/datastore/tables/${TABLE}`);
    tableEnsured = true;
    return;
  } catch {
    // Table missing — create it.
  }
  await lemmaFetch(`/pods/${POD_ID}/datastore/tables`, {
    method: "POST",
    body: JSON.stringify({
      name: TABLE,
      columns: [
        { name: "session_id", type: "TEXT", required: true },
        { name: "title", type: "TEXT" },
        { name: "round", type: "INTEGER", required: true },
        { name: "score", type: "INTEGER", required: true },
        { name: "total", type: "INTEGER", required: true },
        { name: "topic_stats", type: "JSON" },
        { name: "weak_topics", type: "JSON" },
      ],
    }),
  });
  tableEnsured = true;
}

export type LemmaRoundRecord = {
  session_id: string;
  title: string;
  round: number;
  score: number;
  total: number;
  topic_stats: unknown;
  weak_topics: unknown;
};

export async function saveRoundToLemma(record: LemmaRoundRecord) {
  if (!lemmaConfigured()) {
    throw new Error("Lemma is not configured (missing LEMMA_POD_ID / LEMMA_TOKEN).");
  }
  await ensureTable();
  return lemmaFetch(`/pods/${POD_ID}/datastore/tables/${TABLE}/records`, {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export async function listRoundsFromLemma(sessionId?: string) {
  if (!lemmaConfigured()) return [];
  await ensureTable();
  const data = await lemmaFetch(
    `/pods/${POD_ID}/datastore/tables/${TABLE}/records?limit=100`
  );
  const items: LemmaRoundRecord[] = data?.items ?? data?.records ?? [];
  return sessionId ? items.filter((r) => r.session_id === sessionId) : items;
}
