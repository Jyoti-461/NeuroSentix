import { useEffect, useState, useRef, useCallback } from "react";
import { fetchAllData } from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";

/* ─── Config ──────────────────────────────────── */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://neurosentix.onrender.com";
const PING_INTERVAL_MS  = 4000;   // poll every 4s
const PING_TIMEOUT_MS   = 6000;   // give each ping 6s to respond
const WARM_UP_ESTIMATE  = 50;     // seconds shown in progress bar

const SENTIMENT_CONFIG = {
  Positive: { color: "var(--color-positive)", bg: "var(--color-positive-light)", dark: "var(--color-positive-dark)", icon: "↑" },
  Negative: { color: "var(--color-negative)", bg: "var(--color-negative-light)", dark: "var(--color-negative-dark)", icon: "↓" },
  Neutral:  { color: "var(--color-neutral)",  bg: "var(--color-neutral-light)",  dark: "var(--color-neutral)",      icon: "→" },
};

const PIE_COLORS = [
  "var(--color-positive)",
  "var(--color-negative)",
  "var(--color-neutral)",
];

const fmtDate  = (d) => new Date(d).toISOString().split("T")[0];
const todayStr = fmtDate(new Date());
const WEEKDAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ─── Wake-Up Screen ──────────────────────────── */
function WakeUpScreen({ elapsed, onRetry }) {
  // Smooth progress: ramps up fast early, slows near 90%
  const raw  = Math.min(elapsed / WARM_UP_ESTIMATE, 0.92);
  const pct  = Math.round(raw * 100);
  const dots = ".".repeat((Math.floor(elapsed / 0.8) % 3) + 1);

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-primary)", padding: "2rem",
    }}>
      <div style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "2.5rem 2rem",
        maxWidth: 420, width: "100%",
        textAlign: "center",
        boxShadow: "var(--shadow-md)",
      }}>
        {/* Animated server icon */}
        <div style={{
          width: 56, height: 56, borderRadius: "var(--radius-lg)",
          background: "var(--color-accent-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.25rem",
          fontSize: "1.75rem",
          animation: "pulse 2s ease-in-out infinite",
        }}>
          ⚡
        </div>

        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          Starting up the server{dots}
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", marginBottom: "1.75rem", lineHeight: 1.6 }}>
          The backend is waking from sleep. This usually takes under 60 seconds. Your dashboard will load automatically.
        </p>

        {/* Progress bar */}
        <div style={{ marginBottom: "0.625rem" }}>
          <div style={{
            height: 8, background: "var(--bg-surface)",
            borderRadius: 99, overflow: "hidden",
            border: "1px solid var(--border-subtle)",
          }}>
            <div style={{
              height: "100%",
              width: `${pct}%`,
              background: "var(--color-accent)",
              borderRadius: 99,
              transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
            }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
          <span>{Math.round(elapsed)}s elapsed</span>
          <span>{pct}%</span>
        </div>

        {/* Retry button — shown after 70s */}
        {elapsed > 70 && (
          <button
            onClick={onRetry}
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1.5rem",
              border: "1.5px solid var(--border-default)",
              borderRadius: "99px",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: "0.875rem", fontWeight: 600,
              cursor: "pointer",
              transition: "all var(--dur-fast) var(--ease-out)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-surface)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
          >
            Retry now
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}

/* ─── Custom Tooltip ──────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)",
      padding: "10px 14px",
      boxShadow: "var(--shadow-md)",
      fontSize: "0.8125rem",
      color: "var(--text-primary)",
    }}>
      {label && <p style={{ color: "var(--text-tertiary)", marginBottom: 4, fontWeight: 500 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "var(--color-accent)", fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

/* ─── Stat Card ───────────────────────────────── */
function StatCard({ label, value, total, sentiment, delay = 0 }) {
  const cfg = SENTIMENT_CONFIG[sentiment] || {};
  const pct = total ? Math.round((value / total) * 100) : 0;
  const barRef = useRef(null);

  useEffect(() => {
    if (barRef.current) barRef.current.style.transform = "scaleX(0)";
    const t = setTimeout(() => {
      if (barRef.current) barRef.current.style.transform = `scaleX(${pct / 100})`;
    }, 300 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem 1.5rem",
        boxShadow: "var(--shadow-sm)",
        transition: "box-shadow var(--dur-base) var(--ease-out), transform var(--dur-fast) var(--ease-spring)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: cfg.color, borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
          {label}
        </span>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", background: cfg.bg, color: cfg.dark, letterSpacing: "0.05em" }}>
          {cfg.icon} {pct}%
        </span>
      </div>
      <div style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: cfg.color, lineHeight: 1, marginBottom: "0.875rem", fontVariantNumeric: "tabular-nums" }}>
        {value.toLocaleString()}
      </div>
      <div style={{ height: 6, background: "var(--bg-surface)", borderRadius: "99px", overflow: "hidden" }}>
        <div ref={barRef} style={{
          height: "100%", borderRadius: "99px", background: cfg.color,
          transform: "scaleX(0)", transformOrigin: "left center",
          transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
    </div>
  );
}

/* ─── Table Row ───────────────────────────────── */
function TableRow({ item }) {
  const cfg = SENTIMENT_CONFIG[item.sentiment] || { bg: "var(--bg-surface)", color: "var(--text-tertiary)", dark: "var(--text-tertiary)", icon: "–" };
  const score = typeof item.score === "number" ? item.score.toFixed(3) : item.score;
  return (
    <tr
      style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background var(--dur-fast) var(--ease-out)" }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-surface)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <td style={{ padding: "0.75rem 1rem", color: "var(--text-secondary)", fontSize: "0.875rem", maxWidth: 320 }}>
        <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.text}</span>
      </td>
      <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", padding: "3px 10px", borderRadius: "99px", background: cfg.bg, color: cfg.dark || cfg.color, textTransform: "uppercase" }}>
          {cfg.icon} {item.sentiment}
        </span>
      </td>
      <td style={{ padding: "0.75rem 1rem", textAlign: "center", fontVariantNumeric: "tabular-nums", fontSize: "0.875rem", fontWeight: 600, color: cfg.color }}>
        {score}
      </td>
    </tr>
  );
}

/* ─── Calendar Popover ────────────────────────── */
function CalendarPopover({ allData, selectedDate, onSelect, onClose }) {
  const [calDate, setCalDate] = useState(selectedDate ? new Date(selectedDate + "T12:00:00") : new Date());
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const datesWithData = new Set(allData.map(item => item.created_at ? fmtDate(item.created_at) : null).filter(Boolean));
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))];
  const changeMonth = (dir) => setCalDate(new Date(year, month + dir, 1));

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999 }} />
      <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 1000, background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)", padding: "1rem", minWidth: 280 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          {["‹","›"].map((arrow, idx) => (
            <button key={arrow} onClick={() => changeMonth(idx === 0 ? -1 : 1)}
              style={{ background: "transparent", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", padding: "3px 10px", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.75rem" }}>
              {arrow}
            </button>
          ))}
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            {MONTHS[month]} {year}
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "0.25rem" }}>
          {WEEKDAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "var(--text-tertiary)", padding: "4px 0", textTransform: "uppercase" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {cells.map((dateObj, idx) => {
            if (!dateObj) return <div key={idx} />;
            const ds = fmtDate(dateObj);
            const isToday = ds === todayStr;
            const isSelected = ds === selectedDate;
            const hasData = datesWithData.has(ds);
            return (
              <button key={idx} onClick={() => { onSelect(isSelected ? null : ds); onClose(); }} disabled={!hasData}
                style={{ width: "100%", aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: isToday ? 700 : 400, borderRadius: "var(--radius-sm)", border: isToday && !isSelected ? "1px solid var(--border-strong)" : "1px solid transparent", background: isSelected ? "var(--color-accent)" : "transparent", color: isSelected ? "var(--text-inverse)" : isToday ? "var(--color-accent)" : hasData ? "var(--text-primary)" : "var(--text-tertiary)", cursor: hasData ? "pointer" : "default", opacity: hasData ? 1 : 0.4, gap: 2 }}>
                <span>{dateObj.getDate()}</span>
                {hasData && <span style={{ width: 4, height: 4, borderRadius: "50%", background: isSelected ? "var(--text-inverse)" : "var(--color-accent)", display: "block" }} />}
              </button>
            );
          })}
        </div>
        {selectedDate && (
          <div style={{ marginTop: "0.75rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem", textAlign: "center" }}>
            <button onClick={() => { onSelect(null); onClose(); }}
              style={{ background: "transparent", border: "1px solid var(--border-default)", borderRadius: "99px", padding: "4px 16px", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 500 }}>
              × Clear date filter
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function CalendarButton({ allData, selectedDate, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", fontWeight: 600, padding: "0.4rem 0.875rem", borderRadius: "99px", border: selectedDate ? "1.5px solid var(--color-accent)" : "1.5px solid var(--border-default)", background: selectedDate ? "var(--color-accent-light)" : "transparent", color: selectedDate ? "var(--color-accent)" : "var(--text-secondary)", cursor: "pointer" }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="5.5" cy="10.5" r="1" fill="currentColor"/>
          <circle cx="8" cy="10.5" r="1" fill="currentColor"/>
          <circle cx="10.5" cy="10.5" r="1" fill="currentColor"/>
        </svg>
        <span className="cal-btn-label">{selectedDate || "Date"}</span>
        {selectedDate && (
          <span onClick={e => { e.stopPropagation(); onSelect(null); }}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: "var(--color-accent)", color: "var(--text-inverse)", fontSize: "0.65rem", fontWeight: 700, cursor: "pointer" }}>×</span>
        )}
      </button>
      {open && <CalendarPopover allData={allData} selectedDate={selectedDate} onSelect={onSelect} onClose={() => setOpen(false)} />}
    </div>
  );
}

/* ─── Dashboard ───────────────────────────────── */
function Dashboard() {
  // "waking" = polling backend; "loading" = backend alive, fetching data; "ready" = all done
  const [phase, setPhase]               = useState("waking");
  const [elapsed, setElapsed]           = useState(0);
  const [data, setData]                 = useState([]);
  const [filter, setFilter]             = useState("All");
  const [search, setSearch]             = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [wcLoaded, setWcLoaded]         = useState(false);

  const stopPing   = useRef(null);
  const stopTicker = useRef(null);

  /* ── Fetch data after backend is alive ── */
  const loadData = useCallback(async () => {
    setPhase("loading");
    try {
      const res = await fetchAllData();
      setData(res);
    } catch (err) {
      console.error("fetchAllData failed:", err);
    } finally {
      setPhase("ready");
    }
  }, []);

  /* ── Poll backend until it responds ── */
  const startPolling = useCallback(() => {
    setElapsed(0);
    setPhase("waking");

    // Elapsed ticker (updates every 800ms for smooth progress)
    const tickerInterval = setInterval(() => {
      setElapsed(s => s + 0.8);
    }, 800);
    stopTicker.current = () => clearInterval(tickerInterval);

    const ping = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
      try {
        // Lightweight health endpoint — falls back to root if /health doesn't exist
        const res = await fetch(`${BACKEND_URL}/health`, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok || res.status < 500) {
          // Backend is alive
          clearInterval(tickerInterval);
          clearInterval(pingInterval);
          loadData();
        }
      } catch {
        clearTimeout(timeout);
        // Still sleeping — keep polling
      }
    };

    ping(); // immediate first attempt
    const pingInterval = setInterval(ping, PING_INTERVAL_MS);
    stopPing.current = () => clearInterval(pingInterval);
  }, [loadData]);

  useEffect(() => {
    startPolling();
    return () => {
      stopPing.current?.();
      stopTicker.current?.();
    };
  }, [startPolling]);

  /* ── Derived data ── */
  const trendFiltered = data.filter(item => {
    const ms = filter === "All" || item.sentiment === filter;
    const mt = (item.text || "").toLowerCase().includes(search.toLowerCase());
    return ms && mt;
  });
  const filteredData = trendFiltered.filter(item =>
    !selectedDate || (item.created_at ? fmtDate(item.created_at) === selectedDate : false)
  );

  const sentimentCount = { Positive: 0, Negative: 0, Neutral: 0 };
  filteredData.forEach(item => { if (item.sentiment) sentimentCount[item.sentiment]++; });

  const chartData = [
    { name: "Positive", value: sentimentCount.Positive },
    { name: "Negative", value: sentimentCount.Negative },
    { name: "Neutral",  value: sentimentCount.Neutral  },
  ];

  const trendMap = {};
  trendFiltered.forEach(item => {
    const date = item.created_at ? new Date(item.created_at).toLocaleDateString() : "Unknown";
    if (!trendMap[date]) trendMap[date] = { date, Positive: 0, Negative: 0, Neutral: 0, count: 0 };
    trendMap[date].count++;
    if (item.sentiment) trendMap[date][item.sentiment]++;
  });
  const trendData = Object.values(trendMap).sort((a, b) => new Date(a.date) - new Date(b.date));

  const total = filteredData.length;

  const sectionTitle = { fontSize: "clamp(1rem, 2vw, 1.125rem)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" };
  const sectionAccent = { width: 4, height: "1em", borderRadius: 2, background: "var(--color-accent)", display: "inline-block", flexShrink: 0 };

  /* ── Wake-up screen ── */
  if (phase === "waking") {
    return <WakeUpScreen elapsed={elapsed} onRetry={() => { stopPing.current?.(); stopTicker.current?.(); startPolling(); }} />;
  }

  /* ── Loading screen (brief — backend alive, fetching data) ── */
  if (phase === "loading") {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <div style={{ textAlign: "center", color: "var(--text-tertiary)" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }} />
          <p style={{ fontSize: "0.9rem", fontWeight: 500 }}>Loading dashboard data…</p>
        </div>
      </div>
    );
  }

  /* ── Dashboard ── */
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100dvh", paddingBottom: "2rem" }}>

      {/* Page Header */}
      <div style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)", padding: "1.5rem var(--page-px, 1.25rem)", display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2 }}>
              Sentiment Dashboard
            </h1>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.8125rem", marginTop: 3 }}>
              {total} records{selectedDate ? ` · ${selectedDate}` : filter === "All" ? " · All sentiments" : ` · ${filter}`}
            </p>
          </div>
          <CalendarButton allData={data} selectedDate={selectedDate} onSelect={setSelectedDate} />
        </div>

        <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", alignItems: "center" }}>
          {["All", "Positive", "Negative", "Neutral"].map(f => {
            const cfg = SENTIMENT_CONFIG[f];
            const active = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{ fontSize: "0.8125rem", fontWeight: 600, padding: "0.4rem 1rem", borderRadius: "99px", border: `1.5px solid ${active ? (cfg?.color || "var(--color-accent)") : "var(--border-default)"}`, background: active ? (cfg?.bg || "var(--color-accent-light)") : "transparent", color: active ? (cfg?.dark || cfg?.color || "var(--color-accent)") : "var(--text-secondary)", cursor: "pointer" }}>
                {f === "All" ? "All" : `${SENTIMENT_CONFIG[f].icon} ${f}`}
              </button>
            );
          })}
          <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ fontSize: "0.875rem", padding: "0.4rem 0.875rem", border: "1.5px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", minWidth: 160 }}
            onFocus={e => { e.target.style.borderColor = "var(--color-accent)"; e.target.style.boxShadow = "0 0 0 3px var(--color-accent-light)"; }}
            onBlur={e  => { e.target.style.borderColor = "var(--border-default)"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "1.5rem var(--page-px, 1.25rem)" }}>

        {selectedDate && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--color-accent-light)", border: "1px solid var(--color-accent)", borderRadius: "var(--radius-md)", padding: "0.625rem 1rem", marginBottom: "1.25rem", fontSize: "0.875rem", color: "var(--color-accent)", fontWeight: 500 }}>
            <span>📅 Showing data for <strong>{new Date(selectedDate + "T12:00:00").toLocaleDateString("default", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong> — {total} record{total !== 1 ? "s" : ""}</span>
            <button onClick={() => setSelectedDate(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-accent)", fontSize: "0.8rem", fontWeight: 600 }}>Clear ×</button>
          </div>
        )}

        {total === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border-default)", color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>∅</div>
            <p style={{ fontSize: "1rem", fontWeight: 500 }}>{selectedDate ? `No records found for ${selectedDate}` : "No records match your filters"}</p>
            {selectedDate && <button onClick={() => setSelectedDate(null)} style={{ marginTop: "1rem", background: "var(--color-accent-light)", border: "1px solid var(--color-accent)", borderRadius: "99px", padding: "0.4rem 1.25rem", cursor: "pointer", color: "var(--color-accent)", fontSize: "0.875rem", fontWeight: 600 }}>Show all dates</button>}
          </div>
        )}

        {(total > 0 || trendData.length > 0) && (
          <>
            {total > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {["Positive", "Negative", "Neutral"].map((s, i) => (
                  <StatCard key={`${s}-${selectedDate}`} label={s} value={sentimentCount[s]} total={total} sentiment={s} delay={i * 80} />
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
              {total > 0 && (
                <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
                  <h2 style={sectionTitle}><span style={sectionAccent} />Sentiment Split</h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} strokeWidth={0} animationBegin={200} animationDuration={900} animationEasing="ease-out" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: "var(--border-strong)", strokeWidth: 1 }}>
                        {chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {trendData.length > 0 && (
                <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <h2 style={{ ...sectionTitle, marginBottom: 0 }}><span style={sectionAccent} />Sentiment Trend</h2>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", background: "var(--bg-surface)", padding: "2px 8px", borderRadius: "99px", border: "1px solid var(--border-subtle)" }}>All dates</span>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke="var(--border-subtle)" />
                      <XAxis dataKey="date" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} axisLine={{ stroke: "var(--border-subtle)" }} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="Positive" stroke="var(--color-positive)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-positive)", strokeWidth: 0 }} activeDot={{ r: 5 }} animationDuration={900} />
                      <Line type="monotone" dataKey="Negative" stroke="var(--color-negative)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-negative)", strokeWidth: 0 }} activeDot={{ r: 5 }} animationDuration={900} />
                      <Line type="monotone" dataKey="Neutral"  stroke="var(--color-neutral)"  strokeWidth={2} dot={{ r: 3, fill: "var(--color-neutral)",  strokeWidth: 0 }} activeDot={{ r: 5 }} animationDuration={900} />
                      <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>{v}</span>} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {total > 0 && (
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "1.5rem", boxShadow: "var(--shadow-sm)", marginBottom: "2rem" }}>
                <h2 style={sectionTitle}><span style={sectionAccent} />Word Cloud</h2>
                {!wcLoaded && <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-tertiary)", padding: "1rem 0" }}><div className="spinner" /><span style={{ fontSize: "0.875rem" }}>Generating word cloud…</span></div>}
                <img src={`${BACKEND_URL}/wordcloud`} alt="Word Cloud" onLoad={() => setWcLoaded(true)} style={{ width: "100%", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", display: wcLoaded ? "block" : "none" }} />
              </div>
            )}

            {total > 0 && (
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <h2 style={{ ...sectionTitle, marginBottom: 0 }}><span style={sectionAccent} />Recent Reviews</h2>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", background: "var(--bg-surface)", padding: "2px 10px", borderRadius: "99px", fontWeight: 600 }}>
                    {selectedDate ? `${total} records on ${selectedDate}` : `Latest 10 of ${filteredData.length}`}
                  </span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "var(--bg-surface)" }}>
                        {["Text", "Sentiment", "Score"].map(h => (
                          <th key={h} style={{ padding: "0.75rem 1rem", textAlign: h === "Text" ? "left" : "center", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-tertiary)", borderBottom: "1px solid var(--border-default)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...filteredData].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, selectedDate ? undefined : 10).map((item, i) => <TableRow key={i} item={item} />)}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: "1rem", textAlign: "center", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
                  <Link to="/history" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-accent)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--color-accent)"}>
                    View full history →
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        :root { --page-px: 1.25rem; }
        @media (min-width: 640px)  { :root { --page-px: 1.5rem; } }
        @media (min-width: 1024px) { :root { --page-px: 2rem; } }
        @media (max-width: 480px) { .cal-btn-label { display: none; } }
      `}</style>
    </div>
  );
}

export default Dashboard;
