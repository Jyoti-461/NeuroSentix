import { useEffect, useState } from "react";
import { fetchAllData } from "../services/api"; // Adjust path if needed

/* ─── Shared Sentiment Config ─── */
const SENTIMENT_CONFIG = {
  Positive: { color: "var(--color-positive)", bg: "var(--color-positive-light)", dark: "var(--color-positive-dark)", icon: "↑" },
  Negative: { color: "var(--color-negative)", bg: "var(--color-negative-light)", dark: "var(--color-negative-dark)", icon: "↓" },
  Neutral:  { color: "var(--color-neutral)",  bg: "var(--color-neutral-light)",  dark: "var(--color-neutral)",      icon: "→" },
};

/* ─── Table Row Component ─── */
function TableRow({ item }) {
  const cfg = SENTIMENT_CONFIG[item.sentiment] || { bg: "var(--bg-surface)", color: "var(--text-tertiary)", icon: "–" };
  const score = typeof item.score === "number" ? item.score.toFixed(3) : item.score;

  return (
    <tr style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background var(--dur-fast) var(--ease-out)" }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-surface)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <td style={{ padding: "0.75rem 1rem", color: "var(--text-secondary)", fontSize: "0.875rem", maxWidth: 320 }}>
        <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.text}
        </span>
      </td>
      <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 700,
          padding: "3px 10px", borderRadius: "99px", background: cfg.bg, color: cfg.dark || cfg.color, textTransform: "uppercase",
        }}>
          {cfg.icon} {item.sentiment}
        </span>
      </td>
      <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontVariantNumeric: "tabular-nums", fontSize: "0.875rem", fontWeight: 600, color: cfg.color }}>
        {score}
      </td>
    </tr>
  );
}

/* ─── History Page Component ─── */
export default function History() {
  const [data, setData]     = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchAllData();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredData = data.filter((item) => {
    const matchesSentiment = filter === "All" || item.sentiment === filter;
    const matchesSearch = (item.text || "").toLowerCase().includes(search.toLowerCase());
    return matchesSentiment && matchesSearch;
  });

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100dvh", paddingBottom: "2rem" }}>
      
      {/* ── Header & Search ── */}
      <div style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)", padding: "1.5rem 1.25rem", display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>History</h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.8125rem" }}>{filteredData.length} records</p>
        </div>

        <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
          {["All", "Positive", "Negative", "Neutral"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              fontSize: "0.8125rem", fontWeight: 600, padding: "0.4rem 1rem", borderRadius: "99px",
              border: `1.5px solid ${filter === f ? "var(--color-accent)" : "var(--border-default)"}`,
              background: filter === f ? "var(--color-accent-light)" : "transparent",
              color: filter === f ? "var(--color-accent)" : "var(--text-secondary)",
              cursor: "pointer",
            }}>
              {f}
            </button>
          ))}
          <input type="text" placeholder="Search text..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "0.4rem 0.875rem", border: "1.5px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none" }}
          />
        </div>
      </div>

      {/* ── Table Area ── */}
      <div style={{ maxWidth: 1280, margin: "2rem auto", padding: "0 1.25rem" }}>
        {loading ? (
          <p style={{ color: "var(--text-tertiary)" }}>Loading records...</p>
        ) : (
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-surface)" }}>
                  {["Text", "Sentiment", "Score"].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: h === "Text" ? "left" : "center", fontSize: "0.75rem", color: "var(--text-tertiary)", borderBottom: "1px solid var(--border-default)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, i) => <TableRow key={i} item={item} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}