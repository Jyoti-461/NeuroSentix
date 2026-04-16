import { useEffect, useState, useMemo } from "react";
import { fetchAllData } from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

/* ─── Design tokens (match your CSS vars) ─── */
const T = {
  positive:      "var(--color-positive)",
  posLight:      "var(--color-positive-light)",
  posDark:       "var(--color-positive-dark)",
  negative:      "var(--color-negative)",
  negLight:      "var(--color-negative-light)",
  negDark:       "var(--color-negative-dark)",
  neutral:       "var(--color-neutral)",
  neutLight:     "var(--color-neutral-light)",
  accent:        "var(--color-accent)",
  accentLight:   "var(--color-accent-light)",
  warning:       "var(--color-warning)",
  warnLight:     "var(--color-warning-light)",
  bgPrimary:     "var(--bg-primary)",
  bgSurface:     "var(--bg-surface)",
  bgElevated:    "var(--bg-elevated)",
  textPrimary:   "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textTertiary:  "var(--text-tertiary)",
  borderSubtle:  "var(--border-subtle)",
  borderDefault: "var(--border-default)",
  shadowSm:      "var(--shadow-sm)",
  shadowMd:      "var(--shadow-md)",
  radiusMd:      "var(--radius-md)",
  radiusLg:      "var(--radius-lg)",
};

const SENTIMENT_COLORS = {
  Positive: T.positive,
  Negative: T.negative,
  Neutral:  T.neutral,
};

/* ─── Helpers ─── */
const pct = (n, total) => total ? Math.round((n / total) * 100) : 0;

function stopWords() {
  return new Set([
    "the","a","an","and","or","but","in","on","at","to","for","of","with",
    "is","it","this","that","was","are","be","as","by","from","i","you","we",
    "he","she","they","have","had","has","do","did","not","no","so","if",
    "my","your","our","its","s","t","re","ve","ll","d","m","can","just","than",
    "then","there","their","what","will","about","up","out","would","could","should",
  ]);
}

function buildWordFreq(data) {
  const freq = {};
  const stop = stopWords();
  data.forEach(({ text }) => {
    if (!text) return;
    text.toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .forEach(w => {
        if (w.length > 2 && !stop.has(w)) freq[w] = (freq[w] || 0) + 1;
      });
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40);
}

/* ─── Sub-components ─── */

/* Card */
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: T.bgElevated,
      border: `1px solid ${T.borderSubtle}`,
      borderRadius: T.radiusLg,
      boxShadow: T.shadowSm,
      padding: "1.5rem 1.75rem",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* Section label */
function SectionLabel({ children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.5rem",
      fontSize: "0.7rem", fontWeight: 700,
      letterSpacing: "0.1em", textTransform: "uppercase",
      color: T.textTertiary, marginBottom: "1.25rem",
    }}>
      <span style={{ width: 3, height: "1em", borderRadius: 2, background: T.accent, display: "inline-block" }} />
      {children}
    </div>
  );
}

/* Summary stat card */
function StatCard({ label, value, sub, color, bg, icon }) {
  return (
    <div style={{
      background: bg || T.bgElevated,
      border: `1px solid ${T.borderSubtle}`,
      borderRadius: T.radiusLg,
      padding: "1.25rem 1.5rem",
      boxShadow: T.shadowSm,
      display: "flex", flexDirection: "column", gap: "0.35rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </span>
        {icon && <span style={{ fontSize: "1.1rem" }}>{icon}</span>}
      </div>
      <span style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: color || T.textPrimary, lineHeight: 1.1 }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: "0.78rem", color: T.textTertiary }}>{sub}</span>}
    </div>
  );
}

/* Alert banner */
function AlertBanner({ type, message }) {
  const isWarning = type === "warning";
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "0.75rem",
      padding: "0.875rem 1.125rem",
      background: isWarning ? T.warnLight : T.negLight,
      border: `1px solid ${isWarning ? T.warning : T.negative}`,
      borderRadius: T.radiusMd,
      marginBottom: "0.625rem",
      animation: "fadeUp 0.3s var(--ease-out) both",
    }}>
      <span style={{ fontSize: "1rem", flexShrink: 0 }}>{isWarning ? "⚠️" : "🚨"}</span>
      <span style={{ fontSize: "0.875rem", fontWeight: 500, color: isWarning ? T.warning : T.negDark, lineHeight: 1.5 }}>
        {message}
      </span>
    </div>
  );
}

/* Insight pill */
function InsightItem({ text, icon, color }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "0.75rem",
      padding: "0.875rem 1rem",
      background: T.bgSurface,
      border: `1px solid ${T.borderSubtle}`,
      borderRadius: T.radiusMd,
      marginBottom: "0.625rem",
      animation: "fadeUp 0.35s var(--ease-out) both",
    }}>
      <span style={{ fontSize: "1rem", flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: "0.875rem", color: color || T.textSecondary, lineHeight: 1.55 }}>{text}</span>
    </div>
  );
}

/* Word cloud */
function WordCloud({ words }) {
  if (!words.length) return <p style={{ color: T.textTertiary, fontSize: "0.875rem" }}>No text data available.</p>;

  const max = words[0][1];
  const sentimentTints = [T.positive, T.accent, T.neutral, T.negative, T.warning];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
      {words.map(([word, count], i) => {
        const scale = 0.75 + (count / max) * 1.5;
        const color = sentimentTints[i % sentimentTints.length];
        return (
          <span key={word} style={{
            fontSize: `${Math.min(scale, 2)}rem`,
            fontWeight: count / max > 0.5 ? 700 : 500,
            color,
            opacity: 0.6 + (count / max) * 0.4,
            lineHeight: 1.3,
            cursor: "default",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = `${0.6 + (count / max) * 0.4}`; }}
          title={`${count} occurrence${count > 1 ? "s" : ""}`}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

/* Source bar row */
function SourceRow({ name, count, total, color }) {
  const p = pct(count, total);
  const labels = { manual: "Manual Input", csv_upload: "CSV Upload", twitter_reply: "Twitter / X" };
  const icons  = { manual: "✏️", csv_upload: "📂", twitter_reply: "🐦" };
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: T.textPrimary, display: "flex", gap: "0.4rem", alignItems: "center" }}>
          {icons[name] || "📄"} {labels[name] || name}
        </span>
        <span style={{ fontSize: "0.8125rem", fontWeight: 700, color }}>
          {count} &nbsp;<span style={{ color: T.textTertiary, fontWeight: 400 }}>({p}%)</span>
        </span>
      </div>
      <div style={{ height: 8, background: T.bgSurface, borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          background: color,
          width: `${p}%`,
          transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
    </div>
  );
}

/* Custom tooltip for charts */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.bgElevated,
      border: `1px solid ${T.borderDefault}`,
      borderRadius: T.radiusMd,
      padding: "0.625rem 0.875rem",
      boxShadow: T.shadowMd,
      fontSize: "0.8125rem",
    }}>
      {label && <p style={{ color: T.textTertiary, marginBottom: "0.35rem", fontWeight: 600 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || T.textPrimary, fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

/* Loading skeleton */
function Skeleton({ h = 200 }) {
  return (
    <div style={{
      height: h,
      borderRadius: T.radiusMd,
      background: `linear-gradient(90deg, ${T.bgSurface} 25%, ${T.bgElevated} 50%, ${T.bgSurface} 75%)`,
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
    }} />
  );
}

/* ─────────────────────────────────────────
   MAIN REPORTS COMPONENT
   ───────────────────────────────────────── */
export default function Reports() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all"); // all | Positive | Negative | Neutral

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await fetchAllData();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Derived analytics ── */
  const analytics = useMemo(() => {
    const total = data.length;
    const counts = {
      Positive: data.filter(d => d.sentiment === "Positive").length,
      Negative: data.filter(d => d.sentiment === "Negative").length,
      Neutral:  data.filter(d => d.sentiment === "Neutral").length,
    };

    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    // Pie data
    const pieData = [
      { name: "Positive", value: counts.Positive },
      { name: "Negative", value: counts.Negative },
      { name: "Neutral",  value: counts.Neutral  },
    ].filter(d => d.value > 0);

    // Trend: group by date
    const trendMap = {};
    data.forEach(item => {
      if (!item.created_at) return;
      const date = new Date(item.created_at).toISOString().split("T")[0];
      if (!trendMap[date]) trendMap[date] = { date, Positive: 0, Negative: 0, Neutral: 0, total: 0 };
      trendMap[date][item.sentiment]++;
      trendMap[date].total++;
    });
    const trendData = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

    // Last-3-days positive delta
    let posDelta = null;
    if (trendData.length >= 2) {
      const recent = trendData.slice(-3);
      const older  = trendData.slice(-6, -3);
      const recentPos = recent.reduce((s, d) => s + d.Positive, 0);
      const olderPos  = older.reduce((s, d) => s + d.Positive, 0);
      if (olderPos > 0) posDelta = Math.round(((recentPos - olderPos) / olderPos) * 100);
    }

    // Negative spike detection
    const negSpikes = trendData.filter(d => d.total > 0 && (d.Negative / d.total) > 0.5);

    // Source breakdown
    const sourceMap = {};
    data.forEach(item => {
      const src = item.source || "manual";
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });
    const sourceData = Object.entries(sourceMap).map(([name, count]) => ({ name, count }));

    // Word cloud
    const wordCloud = buildWordFreq(data);

    // Alerts
    const alerts = [];
    const negPct = pct(counts.Negative, total);
    if (negPct > 40) alerts.push({ type: "warning", message: `Negative sentiment is at ${negPct}% — above the 40% threshold. Consider reviewing recent feedback.` });
    if (negSpikes.length > 0) alerts.push({ type: "error", message: `Negative sentiment spike detected on: ${negSpikes.map(d => d.date).join(", ")}.` });
    if (total === 0) alerts.push({ type: "warning", message: "No data available yet. Upload or analyze some text to generate insights." });
    const recentDates = [...new Set(data.map(d => d.created_at?.split("T")[0]).filter(Boolean))].sort().slice(-7);
    if (recentDates.length === 0 && total > 0) alerts.push({ type: "warning", message: "Activity has been unusually low recently." });

    // Insights
    const insights = [];
    if (total > 0) {
      const posPct = pct(counts.Positive, total);
      if (posPct > 60) insights.push({ icon: "🟢", text: `${posPct}% of all feedback is positive — overall sentiment is strongly favorable.` });
      else if (posPct < 30) insights.push({ icon: "🔴", text: `Only ${posPct}% positive feedback detected. Sentiment is trending negative.` });
      else insights.push({ icon: "🟡", text: `Sentiment is balanced: ${posPct}% positive, ${pct(counts.Negative, total)}% negative.` });

      if (posDelta !== null) {
        if (posDelta > 0) insights.push({ icon: "📈", text: `Positive sentiment increased by ${posDelta}% in the last 3 days compared to previous period.` });
        else if (posDelta < 0) insights.push({ icon: "📉", text: `Positive sentiment declined by ${Math.abs(posDelta)}% in the last 3 days. Monitor closely.` });
      }

      if (counts.Negative > counts.Positive) {
        insights.push({ icon: "⚡", text: "Negative entries outnumber positive ones. Prioritize addressing user pain points." });
      }

      const topSource = sourceData.sort((a, b) => b.count - a.count)[0];
      if (topSource) insights.push({ icon: "📂", text: `Most data comes from "${topSource.name}" (${pct(topSource.count, total)}% of total).` });

      if (trendData.length >= 7) insights.push({ icon: "📅", text: `Data spans ${trendData.length} active days, providing a reliable trend signal.` });
    }

    return { total, counts, dominant, pieData, trendData, sourceData, wordCloud, alerts, insights, negPct: pct(counts.Negative, total) };
  }, [data]);

  /* ── Styles ── */
  const grid2 = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" };
  const grid4 = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" };

  /* ── Loading ── */
  if (loading) return (
    <div style={{ background: T.bgPrimary, minHeight: "100dvh", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <Skeleton h={36} />
        </div>
        <div style={grid4}>
          {[1,2,3,4].map(i => <Skeleton key={i} h={100} />)}
        </div>
        <div style={{ marginTop: "1.5rem" }}><Skeleton h={300} /></div>
        <div style={{ marginTop: "1.5rem" }}><Skeleton h={260} /></div>
      </div>
    </div>
  );

  const { total, counts, dominant, pieData, trendData, sourceData, wordCloud, alerts, insights } = analytics;

  return (
    <div style={{ background: T.bgPrimary, minHeight: "100dvh", padding: "1.5rem 1rem 5rem", fontFamily: "var(--font-sans)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: "1.75rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h1 style={{ fontSize: "clamp(1.375rem,3vw,1.875rem)", fontWeight: 800, color: T.textPrimary, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
              Reports
            </h1>
            <p style={{ color: T.textTertiary, fontSize: "0.875rem", marginTop: 4 }}>
              Auto-generated insights from your sentiment data
            </p>
          </div>
          <button
            onClick={loadData}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              fontSize: "0.8125rem", fontWeight: 600, padding: "0.45rem 1rem",
              borderRadius: T.radiusMd, border: `1px solid ${T.borderDefault}`,
              background: T.bgElevated, color: T.textSecondary, cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = T.bgSurface}
            onMouseLeave={e => e.currentTarget.style.background = T.bgElevated}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* ── 1. ALERTS ── */}
        {alerts.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            {alerts.map((a, i) => <AlertBanner key={i} type={a.type} message={a.message} />)}
          </div>
        )}

        {/* ── 2. SUMMARY CARDS ── */}
        <div style={{ ...grid4, marginBottom: "1.25rem" }}>
          <StatCard label="Total Entries" value={total} icon="📊" />
          <StatCard label="Positive" value={`${pct(counts.Positive, total)}%`} sub={`${counts.Positive} entries`} color={T.positive} icon="↑" />
          <StatCard label="Negative"  value={`${pct(counts.Negative, total)}%`} sub={`${counts.Negative} entries`}  color={T.negative} icon="↓" />
          <StatCard label="Dominant"  value={dominant} color={SENTIMENT_COLORS[dominant] || T.textPrimary} icon="🏆" />
        </div>

        {/* ── 3. PIE + SOURCE SIDE BY SIDE ── */}
        <div style={{ ...grid2, marginBottom: "1.25rem" }}>

          {/* Pie Chart */}
          <Card>
            <SectionLabel>Sentiment Distribution</SectionLabel>
            {total === 0 ? (
              <p style={{ color: T.textTertiary, fontSize: "0.875rem" }}>No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Source Breakdown */}
          <Card>
            <SectionLabel>Source Breakdown</SectionLabel>
            {sourceData.length === 0 ? (
              <p style={{ color: T.textTertiary, fontSize: "0.875rem" }}>No source data.</p>
            ) : (
              sourceData
                .sort((a, b) => b.count - a.count)
                .map((s, i) => {
                  const colors = [T.accent, T.positive, T.neutral, T.negative];
                  return (
                    <SourceRow
                      key={s.name}
                      name={s.name}
                      count={s.count}
                      total={total}
                      color={colors[i % colors.length]}
                    />
                  );
                })
            )}
          </Card>
        </div>

        {/* ── 4. TREND LINE CHART ── */}
        <Card style={{ marginBottom: "1.25rem" }}>
          <SectionLabel>Sentiment Trend Over Time</SectionLabel>
          {trendData.length < 2 ? (
            <p style={{ color: T.textTertiary, fontSize: "0.875rem" }}>Need at least 2 days of data to show a trend.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={`${T.borderSubtle}`} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: "0.8125rem", paddingTop: "0.75rem" }} />
                <Line type="monotone" dataKey="Positive" stroke={T.positive} strokeWidth={2.5} dot={{ r: 3, fill: T.positive }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Negative" stroke={T.negative} strokeWidth={2.5} dot={{ r: 3, fill: T.negative }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Neutral"  stroke={T.neutral}  strokeWidth={2}   dot={{ r: 3, fill: T.neutral }}  activeDot={{ r: 5 }} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* ── 5. KEY INSIGHTS ── */}
        <Card style={{ marginBottom: "1.25rem" }}>
          <SectionLabel>Key Insights</SectionLabel>
          {insights.length === 0 ? (
            <p style={{ color: T.textTertiary, fontSize: "0.875rem" }}>No insights yet — add some data.</p>
          ) : (
            insights.map((ins, i) => (
              <InsightItem key={i} icon={ins.icon} text={ins.text} />
            ))
          )}
        </Card>

        {/* ── 6. WORD CLOUD ── */}
        <Card style={{ marginBottom: "1.25rem" }}>
          <SectionLabel>Word Cloud</SectionLabel>
          <WordCloud words={wordCloud} />
        </Card>

        {/* ── 7. ACTIVITY BAR CHART ── */}
        {trendData.length > 0 && (
          <Card>
            <SectionLabel>Daily Activity Volume</SectionLabel>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.borderSubtle} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Positive" stackId="a" fill={T.positive} radius={[0,0,0,0]} />
                <Bar dataKey="Neutral"  stackId="a" fill={T.neutral}  radius={[0,0,0,0]} />
                <Bar dataKey="Negative" stackId="a" fill={T.negative} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

      </div>
    </div>
  );
}
