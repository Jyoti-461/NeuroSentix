import { useEffect, useState, useCallback } from "react";
import { fetchAllData } from "../services/api";

/* ─── Sentiment Config ─── */
const SENTIMENT_CONFIG = {
  Positive: {
    dot: "var(--color-accent)",
    badge: { bg: "var(--color-accent-light)", color: "var(--color-accent)" },
    score: "var(--color-accent)",
    pillActive: {
      background: "var(--color-accent-light)",
      color: "var(--color-accent)",
      borderColor: "var(--color-accent)",
    },
  },
  Negative: {
    dot: "var(--color-negative)",
    badge: { bg: "var(--color-negative-light)", color: "var(--color-negative-dark)" },
    score: "var(--color-negative)",
    pillActive: {
      background: "var(--color-negative-light)",
      color: "var(--color-negative-dark)",
      borderColor: "var(--color-negative)",
    },
  },
  Neutral: {
    dot: "var(--color-neutral)",
    badge: { bg: "var(--color-neutral-light)", color: "var(--text-secondary)" },
    score: "var(--color-neutral)",
    pillActive: {
      background: "var(--color-neutral-light)",
      color: "var(--text-secondary)",
      borderColor: "var(--border-strong)",
    },
  },
};

const FILTERS = ["All", "Positive", "Negative", "Neutral"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const fmtDate = (d) => new Date(d).toISOString().split("T")[0];
const todayStr = fmtDate(new Date());

/* ─── Stat Card ─── */
function StatCard({ label, value, sub, valueColor }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      padding: "14px 16px",
    }}>
      <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: valueColor || "var(--text-primary)" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>{sub}</div>
    </div>
  );
}

/* ─── Entry Item ─── */
function EntryItem({ item }) {
  const cfg = SENTIMENT_CONFIG[item.sentiment] || {};
  const score = typeof item.score === "number" ? item.score.toFixed(3) : parseFloat(item.score).toFixed(3);
  const time = item.created_at
    ? new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div style={{
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      padding: "10px 12px",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)",
      background: "var(--bg-surface)",
    }}>
      <span style={{
        fontSize: 10,
        fontWeight: 500,
        padding: "3px 8px",
        borderRadius: 99,
        background: cfg.badge?.bg,
        color: cfg.badge?.color,
        flexShrink: 0,
        marginTop: 2,
      }}>
        {item.sentiment}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>{item.text}</div>
        {time && (
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>{time}</div>
        )}
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, color: cfg.score, flexShrink: 0 }}>{score}</span>
    </div>
  );
}

/* ─── Calendar Cell ─── */
function CalCell({ dateObj, dayItems, isSelected, onClick }) {
  if (!dateObj) return <div style={{ borderRight: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }} />;

  const ds = fmtDate(dateObj);
  const isToday = ds === todayStr;
  const hasItems = dayItems.length > 0;

  const posC = dayItems.filter((x) => x.sentiment === "Positive").length;
  const negC = dayItems.filter((x) => x.sentiment === "Negative").length;
  const neuC = dayItems.filter((x) => x.sentiment === "Neutral").length;

  const dots = [
    ...Array(Math.min(posC, 5)).fill("Positive"),
    ...Array(Math.min(negC, 5)).fill("Negative"),
    ...Array(Math.min(neuC, 5)).fill("Neutral"),
  ];

  return (
    <div
      onClick={() => hasItems && onClick(ds)}
      style={{
        minHeight: 88,
        borderRight: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: 8,
        cursor: hasItems ? "pointer" : "default",
        background: isSelected
          ? "var(--color-positive-light)"
          : hasItems
          ? "var(--bg-elevated)"
          : "var(--bg-surface)",
        transition: `background var(--dur-fast) var(--ease-out)`,
      }}
    >
      <div style={{
        width: 22,
        height: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 500,
        borderRadius: "50%",
        background: isToday ? "var(--text-primary)" : "transparent",
        color: isToday ? "var(--bg-primary)" : "var(--text-secondary)",
        marginBottom: 6,
      }}>
        {dateObj.getDate()}
      </div>

      {hasItems && (
        <>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 3 }}>
            {dots.map((sentiment, i) => (
              <div key={i} style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: SENTIMENT_CONFIG[sentiment]?.dot,
                flexShrink: 0,
              }} />
            ))}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
            {dayItems.length} {dayItems.length === 1 ? "entry" : "entries"}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── History Page ─── */
export default function History() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

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

  const filtered = data.filter((item) => {
    const ms = filter === "All" || item.sentiment === filter;
    const mt = (item.text || "").toLowerCase().includes(search.toLowerCase());
    return ms && mt;
  });

  const grouped = {};
  filtered.forEach((item) => {
    const key = item.created_at ? fmtDate(item.created_at) : "Unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  const total = filtered.length;
  const posCount = filtered.filter((x) => x.sentiment === "Positive").length;
  const negCount = filtered.filter((x) => x.sentiment === "Negative").length;
  const neuCount = filtered.filter((x) => x.sentiment === "Neutral").length;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const changeMonth = (dir) => {
    setCurrentDate(new Date(year, month + dir, 1));
    setSelectedDate(null);
  };

  const handleDayClick = useCallback((ds) => {
    setSelectedDate((prev) => (prev === ds ? null : ds));
  }, []);

  const pillStyle = (f) => {
    const isActive = filter === f;
    const base = {
      fontSize: 12,
      fontWeight: 500,
      padding: "5px 14px",
      borderRadius: 99,
      cursor: "pointer",
      border: "1px solid",
      transition: `all var(--dur-fast) var(--ease-out)`,
    };
    if (!isActive) {
      return {
        ...base,
        background: "transparent",
        color: "var(--text-secondary)",
        borderColor: "var(--border-default)",
      };
    }
    if (f === "All") {
      return {
        ...base,
        background: "var(--bg-surface)",
        color: "var(--text-primary)",
        borderColor: "var(--border-strong)",
      };
    }
    return { ...base, ...SENTIMENT_CONFIG[f]?.pillActive };
  };

  return (
    <div style={{
      background: "var(--bg-primary)",
      minHeight: "100dvh",
      paddingBottom: "2rem",
      fontFamily: "var(--font-sans)",
      color: "var(--text-primary)",
    }}>

      {/* ── Top Bar ── */}
      <div style={{
        background: "var(--bg-elevated)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "1.25rem 1.5rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        justifyContent: "space-between",
        alignItems: "flex-end",
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)" }}>History</h1>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 3 }}>{total} records</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={pillStyle(f)}>{f}</button>
          ))}
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              fontSize: 13,
              padding: "5px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              background: "var(--bg-elevated)",
              color: "var(--text-primary)",
              outline: "none",
              width: 160,
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "1.5rem auto", padding: "0 1.25rem" }}>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: "1.5rem" }}>
          <StatCard label="Total entries" value={data.length} sub="all time" />
          <StatCard
            label="Positive"
            value={posCount}
            sub={total ? `${Math.round((posCount / total) * 100)}% of filtered` : "—"}
            valueColor="var(--color-accent)"
          />
          <StatCard
            label="Negative"
            value={negCount}
            sub={total ? `${Math.round((negCount / total) * 100)}% of filtered` : "—"}
            valueColor="var(--color-negative)"
          />
          <StatCard
            label="Neutral"
            value={neuCount}
            sub={total ? `${Math.round((neuCount / total) * 100)}% of filtered` : "—"}
            valueColor="var(--color-neutral)"
          />
        </div>

        {/* ── Calendar Card ── */}
        <div style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          boxShadow: "var(--shadow-sm)",
        }}>

          {/* Calendar Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-elevated)",
          }}>
            <button
              onClick={() => changeMonth(-1)}
              style={{
                background: "transparent",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                padding: "5px 14px",
                cursor: "pointer",
                color: "var(--text-secondary)",
                fontSize: 13,
                transition: `background var(--dur-fast) var(--ease-out)`,
              }}
            >← prev</button>
            <span style={{ fontSize: 16, fontWeight: 500, color: "var(--text-primary)" }}>
              {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </span>
            <button
              onClick={() => changeMonth(1)}
              style={{
                background: "transparent",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                padding: "5px 14px",
                cursor: "pointer",
                color: "var(--text-secondary)",
                fontSize: 13,
                transition: `background var(--dur-fast) var(--ease-out)`,
              }}
            >next →</button>
          </div>

          {/* Weekday Labels */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border-subtle)",
          }}>
            {WEEKDAYS.map((d) => (
              <div key={d} style={{
                textAlign: "center",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--text-tertiary)",
                padding: "10px 0",
                letterSpacing: "0.04em",
                textTransform: "lowercase",
              }}>{d}</div>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-tertiary)", fontSize: 14 }}>
              Loading…
            </div>
          )}

          {/* Calendar Grid */}
          {!loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
              {calendarCells.map((dateObj, idx) => (
                <CalCell
                  key={idx}
                  dateObj={dateObj}
                  dayItems={dateObj ? grouped[fmtDate(dateObj)] || [] : []}
                  isSelected={dateObj ? fmtDate(dateObj) === selectedDate : false}
                  onClick={handleDayClick}
                />
              ))}
            </div>
          )}

          {/* Detail Panel */}
          {selectedDate && grouped[selectedDate] && (
            <div style={{
              borderTop: "1px solid var(--border-subtle)",
              padding: "1.25rem",
              background: "var(--bg-elevated)",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("default", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </span>
                <button
                  onClick={() => setSelectedDate(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-tertiary)",
                    fontSize: 16,
                    padding: "2px 8px",
                    borderRadius: "var(--radius-sm)",
                    transition: `color var(--dur-fast) var(--ease-out)`,
                  }}
                >✕</button>
              </div>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 280,
                overflowY: "auto",
              }}>
                {grouped[selectedDate].map((item, i) => (
                  <EntryItem key={i} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
