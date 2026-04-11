import { useEffect, useState, useRef } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/* ─── Loading stages ───────────────────────────────────────────── */
const STAGES = [
  { icon: "◎", label: "Waking up server",        detail: "Render spins down after inactivity — nudging it back…",  dur: 4000 },
  { icon: "⟳", label: "Establishing connection",  detail: "Handshaking with the AI backend on Render…",             dur: 3500 },
  { icon: "⬡", label: "Loading sentiment model",  detail: "Spinning up the NLP pipeline and tokenizer…",            dur: 3000 },
  { icon: "◈", label: "Preparing your dashboard", detail: "Almost there — fetching your data…",                      dur: 2500 },
];

/* ─── Fun facts to keep user engaged ──────────────────────────── */
const FACTS = [
  { emoji: "🧠", text: "Sentiment analysis reads emotional tone the way humans do — word by word." },
  { emoji: "📊", text: "Over 80% of unstructured business data is text — sentiment makes it readable." },
  { emoji: "🌐", text: "Twitter (X) processes 500M+ tweets/day. Sentiment models help make sense of them." },
  { emoji: "🔬", text: "Modern NLP models can detect sarcasm and irony with up to 90% accuracy." },
  { emoji: "💡", text: "The word 'fine' can be positive, negative, or neutral — context is everything." },
  { emoji: "📈", text: "Companies that track sentiment respond to customer issues 40% faster on average." },
];

/* ─── Animated dots ────────────────────────────────────────────── */
function Dots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: "50%",
          background: "var(--color-accent)",
          display: "inline-block",
          animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </span>
  );
}

/* ─── Progress bar ─────────────────────────────────────────────── */
function ProgressBar({ pct }) {
  return (
    <div style={{
      width: "100%", height: 4,
      background: "var(--border-subtle)",
      borderRadius: 99, overflow: "hidden",
    }}>
      <div style={{
        height: "100%", borderRadius: 99,
        background: `linear-gradient(90deg, var(--color-accent), var(--color-positive))`,
        width: `${pct}%`,
        transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: "0 0 8px rgba(29,158,117,0.4)",
      }} />
    </div>
  );
}

/* ─── Sentiment orbs (decorative background) ───────────────────── */
function Orbs() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Positive orb */}
      <div style={{
        position: "absolute", top: "-15%", right: "-10%",
        width: "min(420px, 70vw)", height: "min(420px, 70vw)",
        borderRadius: "50%",
        background: "radial-gradient(circle, var(--color-positive-light) 0%, transparent 70%)",
        animation: "orbFloat 8s ease-in-out infinite",
      }} />
      {/* Negative orb */}
      <div style={{
        position: "absolute", bottom: "-20%", left: "-10%",
        width: "min(380px, 60vw)", height: "min(380px, 60vw)",
        borderRadius: "50%",
        background: "radial-gradient(circle, var(--color-negative-light) 0%, transparent 70%)",
        animation: "orbFloat 10s ease-in-out 2s infinite reverse",
      }} />
      {/* Neutral orb */}
      <div style={{
        position: "absolute", top: "40%", left: "30%",
        width: "min(250px, 40vw)", height: "min(250px, 40vw)",
        borderRadius: "50%",
        background: "radial-gradient(circle, var(--color-neutral-light) 0%, transparent 70%)",
        animation: "orbFloat 12s ease-in-out 4s infinite",
      }} />
    </div>
  );
}

/* ─── AppLoader ────────────────────────────────────────────────── */
function AppLoader({ children }) {
  const [isReady, setIsReady]         = useState(false);
  const [stageIdx, setStageIdx]       = useState(0);
  const [factIdx, setFactIdx]         = useState(0);
  const [factVisible, setFactVisible] = useState(true);
  const [progress, setProgress]       = useState(0);
  const [elapsed, setElapsed]         = useState(0);
  const [dots, setDots]               = useState("");
  const startTime                     = useRef(Date.now());

  /* ── Wake backend ── */
  useEffect(() => {
    const wake = async () => {
      let retries = 8;
      while (retries--) {
        try {
          const res = await fetch(`${BACKEND_URL}/health`);
          if (res.ok) { setIsReady(true); return; }
        } catch (_) {}
        await new Promise((r) => setTimeout(r, 3000));
      }
      // After max retries just proceed anyway
      setIsReady(true);
    };
    wake();
  }, []);

  /* ── Cycle stages ── */
  useEffect(() => {
    if (isReady) return;
    const timers = [];
    let acc = 0;
    STAGES.forEach((s, i) => {
      acc += s.dur;
      timers.push(setTimeout(() => setStageIdx(Math.min(i + 1, STAGES.length - 1)), acc));
    });
    return () => timers.forEach(clearTimeout);
  }, [isReady]);

  /* ── Smooth progress ── */
  useEffect(() => {
    if (isReady) { setProgress(100); return; }
    const interval = setInterval(() => {
      const secs = (Date.now() - startTime.current) / 1000;
      setElapsed(Math.floor(secs));
      // Progress asymptotically approaches 95% until backend responds
      setProgress((p) => Math.min(p + (95 - p) * 0.012, 95));
    }, 200);
    return () => clearInterval(interval);
  }, [isReady]);

  /* ── Cycle facts with fade ── */
  useEffect(() => {
    if (isReady) return;
    const interval = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIdx((i) => (i + 1) % FACTS.length);
        setFactVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, [isReady]);

  if (isReady) return children;

  const stage = STAGES[Math.min(stageIdx, STAGES.length - 1)];
  const fact  = FACTS[factIdx];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "var(--bg-primary)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "2rem 1.25rem",
    }}>
      <Orbs />

      {/* ── Main card ── */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 480,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-lg)",
        padding: "2.5rem 2rem",
        animation: "scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
      }}>

        {/* Logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "2rem" }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-positive) 0%, var(--color-accent) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "logoOrb 3s ease-in-out infinite",
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.25" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
              SentiScope
            </div>
            <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Sentiment Analysis
            </div>
          </div>
        </div>

        {/* Stage indicator */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.625rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{
                fontSize: "1rem", color: "var(--color-accent)",
                animation: "spin 2s linear infinite", display: "inline-block",
              }}>
                {stage.icon}
              </span>
              <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {stage.label}
              </span>
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-tertiary)", fontVariantNumeric: "tabular-nums" }}>
              {Math.round(progress)}%
            </span>
          </div>
          <ProgressBar pct={progress} />
          <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: "0.5rem", lineHeight: 1.5 }}>
            {stage.detail}
          </p>
        </div>

        {/* Stage steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.75rem" }}>
          {STAGES.map((s, i) => {
            const done    = i < stageIdx;
            const active  = i === stageIdx;
            const pending = i > stageIdx;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "0.625rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "var(--radius-md)",
                background: active ? "var(--color-accent-light)" : "transparent",
                border: `1px solid ${active ? "var(--color-accent)" : "transparent"}`,
                transition: "all 0.4s var(--ease-out)",
              }}>
                {/* Status icon */}
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", fontWeight: 800,
                  background: done ? "var(--color-accent)" : active ? "var(--color-accent-light)" : "var(--bg-surface)",
                  border: `2px solid ${done ? "var(--color-accent)" : active ? "var(--color-accent)" : "var(--border-default)"}`,
                  color: done ? "#fff" : active ? "var(--color-accent)" : "var(--text-tertiary)",
                  transition: "all 0.4s var(--ease-out)",
                }}>
                  {done ? "✓" : active ? <Dots /> : i + 1}
                </div>
                <span style={{
                  fontSize: "0.8125rem", fontWeight: active ? 600 : 450,
                  color: done ? "var(--color-accent)" : active ? "var(--text-primary)" : "var(--text-tertiary)",
                  transition: "color 0.3s var(--ease-out)",
                }}>
                  {s.label}
                </span>
                {active && (
                  <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--color-accent)", fontWeight: 600 }}>
                    In progress
                  </span>
                )}
                {done && (
                  <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--color-accent)", fontWeight: 500 }}>
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Elapsed time */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0.6rem 0.875rem",
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-md)",
          marginBottom: "1.5rem",
        }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500 }}>
            Cold start — Render free tier
          </span>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
            {elapsed}s elapsed
          </span>
        </div>

        {/* Rotating fact */}
        <div style={{
          padding: "0.875rem 1rem",
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
          opacity: factVisible ? 1 : 0,
          transform: factVisible ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.4s var(--ease-out), transform 0.4s var(--ease-out)",
          minHeight: 72,
        }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: "0.375rem" }}>
            💡 Did you know?
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
            {fact.emoji} {fact.text}
          </p>
        </div>
      </div>

      {/* Footnote */}
      <p style={{
        position: "relative", zIndex: 1,
        marginTop: "1.25rem", fontSize: "0.75rem",
        color: "var(--text-tertiary)", textAlign: "center", lineHeight: 1.5,
      }}>
        Render free tier spins down after 15 min of inactivity.<br />
        First load takes ~20–30 seconds — totally normal.
      </p>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-30px) scale(1.04); }
        }
        @keyframes logoOrb {
          0%, 100% { box-shadow: 0 0 0 0 rgba(29,158,117,0.3); }
          50%       { box-shadow: 0 0 0 10px rgba(29,158,117,0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AppLoader;
