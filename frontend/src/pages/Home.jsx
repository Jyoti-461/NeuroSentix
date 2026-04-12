import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/* ─── Wake-up status stages ─────────────────────── */
const WAKE_STAGES = [
  { key: "connecting",   icon: "◎", label: "Connecting to server",      detail: "Nudging Render out of sleep…" },
  { key: "handshaking",  icon: "⟳", label: "Establishing connection",   detail: "Backend is responding…" },
  { key: "loading",      icon: "⬡", label: "Loading sentiment model",   detail: "NLP pipeline warming up…" },
  { key: "ready",        icon: "✓", label: "Dashboard ready",           detail: "Everything is live!" },
];

/* ─── Feature highlights ────────────────────────── */
const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: "Real-time Analysis",
    desc: "Paste any text and get instant sentiment classification — positive, negative, or neutral — powered by a fine-tuned NLP model.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
    title: "Batch CSV Upload",
    desc: "Upload thousands of reviews, tweets, or feedback entries at once. NeuroSentix processes them all and stores results for exploration.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
    title: "Visual Dashboard",
    desc: "Explore sentiment trends over time, see split breakdowns on an interactive pie chart, and scan results in a searchable table.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Word Cloud",
    desc: "Automatically generated word clouds reveal the most frequent terms driving positive and negative sentiment in your dataset.",
  },
];

/* ─── Stats ─────────────────────────────────────── */
const STATS = [
  { value: "3", label: "Sentiment classes" },
  { value: "~90%", label: "Model accuracy" },
  { value: "CSV", label: "Batch support" },
  { value: "Live", label: "Trend charts" },
];

/* ─── Floating orbs ─────────────────────────────── */
function Orbs() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div style={{
        position: "absolute", top: "-10%", right: "-8%",
        width: "min(500px,80vw)", height: "min(500px,80vw)", borderRadius: "50%",
        background: "radial-gradient(circle, var(--color-positive-light) 0%, transparent 65%)",
        animation: "orbFloat 9s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "5%", left: "-12%",
        width: "min(420px,70vw)", height: "min(420px,70vw)", borderRadius: "50%",
        background: "radial-gradient(circle, var(--color-accent-light) 0%, transparent 65%)",
        animation: "orbFloat 11s ease-in-out 3s infinite reverse",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "45%",
        width: "min(300px,50vw)", height: "min(300px,50vw)", borderRadius: "50%",
        background: "radial-gradient(circle, var(--color-negative-light) 0%, transparent 65%)",
        animation: "orbFloat 14s ease-in-out 6s infinite",
      }} />
    </div>
  );
}

/* ─── Animated dots ─────────────────────────────── */
function Dots() {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 4, height: 4, borderRadius: "50%",
          background: "var(--color-accent)", display: "inline-block",
          animation: `dotBounce 1.2s ease-in-out ${i*0.2}s infinite`,
        }}/>
      ))}
    </span>
  );
}

/* ─── Wake status panel ─────────────────────────── */
function WakeStatus({ stageIdx, isReady, elapsed, progress }) {
  return (
    <div style={{
      marginTop: "1.25rem",
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      padding: "1rem 1.25rem",
      boxShadow: "var(--shadow-sm)",
    }}>
      {/* Progress bar */}
      <div style={{ marginBottom: "0.875rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)" }}>
            {isReady ? "Backend active" : "Waking up Render…"}
          </span>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: isReady ? "var(--color-accent)" : "var(--text-tertiary)", fontVariantNumeric: "tabular-nums" }}>
            {isReady ? "Ready" : `${elapsed}s`}
          </span>
        </div>
        <div style={{ height: 3, background: "var(--border-subtle)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: "linear-gradient(90deg, var(--color-accent), var(--color-positive))",
            width: `${progress}%`,
            transition: progress >= 99 ? "width 0.5s cubic-bezier(0.16,1,0.3,1)" : "width 0.8s cubic-bezier(0.16,1,0.3,1)",
            boxShadow: "0 0 6px rgba(29,158,117,0.4)",
          }}/>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {WAKE_STAGES.map((s, i) => {
          const done   = i < stageIdx || isReady;
          const active = i === stageIdx && !isReady;
          return (
            <div key={s.key} style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.35rem 0.625rem",
              borderRadius: "var(--radius-sm)",
              background: active ? "var(--color-accent-light)" : "transparent",
              transition: "background 0.3s var(--ease-out)",
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.6rem", fontWeight: 800,
                background: done ? "var(--color-accent)" : active ? "var(--color-accent-light)" : "var(--bg-surface)",
                border: `1.5px solid ${done || active ? "var(--color-accent)" : "var(--border-default)"}`,
                color: done ? "#fff" : active ? "var(--color-accent)" : "var(--text-tertiary)",
                transition: "all 0.4s var(--ease-out)",
              }}>
                {done ? "✓" : active ? <Dots /> : i + 1}
              </div>
              <span style={{
                fontSize: "0.775rem",
                fontWeight: active ? 600 : done ? 500 : 400,
                color: done ? "var(--color-accent)" : active ? "var(--text-primary)" : "var(--text-tertiary)",
                transition: "color 0.3s var(--ease-out)",
              }}>
                {s.label}
              </span>
              {active && (
                <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: "var(--text-tertiary)" }}>
                  {s.detail}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {isReady && (
        <p style={{
          marginTop: "0.75rem", fontSize: "0.775rem", fontWeight: 500,
          color: "var(--color-accent)", textAlign: "center",
          animation: "fadeUp 0.4s var(--ease-out) both",
        }}>
          ✓ Server is live — dashboard unlocked!
        </p>
      )}
    </div>
  );
}

/* ─── HOME PAGE ─────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();

  const [isReady, setIsReady]   = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed]   = useState(0);
  const readyRef                = useRef(false);
  const startTime               = useRef(Date.now());

  /* ── Ping backend ── */
  useEffect(() => {
    const wake = async () => {
      let retries = 10;
      while (retries--) {
        try {
          const res = await fetch(`${BACKEND_URL}/health`);
          if (res.ok) {
            readyRef.current = true;
            setIsReady(true);
            setProgress(100);
            return;
          }
        } catch (_) {}
        await new Promise(r => setTimeout(r, 3000));
      }
      readyRef.current = true;
      setIsReady(true);
      setProgress(100);
    };
    wake();
  }, []);

  /* ── Progress crawl (asymptotes at 92%) ── */
  useEffect(() => {
    const t = setInterval(() => {
      if (readyRef.current) return;
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
      setProgress(p => p + (92 - p) * 0.015);
    }, 250);
    return () => clearInterval(t);
  }, []);

  /* ── Elapsed counter ── */
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  /* ── Visual stages ── */
  useEffect(() => {
    const timers = [
      setTimeout(() => setStageIdx(1), 4000),
      setTimeout(() => setStageIdx(2), 9000),
      setTimeout(() => setStageIdx(3), 14000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      background: "var(--bg-primary)",
      minHeight: "100dvh",
      position: "relative",
      overflowX: "hidden",
    }}>
      <Orbs />

      {/* ── Navbar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "color-mix(in srgb, var(--bg-primary) 85%, transparent)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 1.25rem", height: 58,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}>
  <div style={{
    width: 32, 
    height: 32, 
    borderRadius: "50%",
    //overflow: "hidden", // 🔴 Keeps it a perfect circle
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center"
  }}>
    <img
      src="/neurosentixlogo.png"
      alt="logo"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        transform: "scale(1.8)" // 🟢 Keeps the brain graphic filling the circle
      }}
    />
  </div>
</div>
            <div>
              <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>NeuroSentix</span>
            </div>
          </div>

          {/* Nav links */}
          <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {["Features", "About", "How it works"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`} style={{
                fontSize: "0.8375rem", fontWeight: 500,
                padding: "0.375rem 0.75rem", borderRadius: "var(--radius-md)",
                color: "var(--text-secondary)", textDecoration: "none",
                transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="var(--bg-overlay)"; e.currentTarget.style.color="var(--text-primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--text-secondary)"; }}
              >{l}</a>
            ))}
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "4rem 1.25rem 3rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
        gap: "3rem",
        alignItems: "center",
        position: "relative", zIndex: 1,
      }}>
        {/* Left — copy */}
        <div style={{ animation: "fadeUp 0.6s var(--ease-out) both" }}>
          {/* Tag */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            color: "var(--color-accent)", background: "var(--color-accent-light)",
            padding: "0.3rem 0.75rem", borderRadius: "99px", marginBottom: "1.25rem",
            border: "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent)", animation: "pulse-ring 2s ease-out infinite", display: "inline-block" }}/>
            AI-Powered Sentiment Analysis
          </div>

          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 900, lineHeight: 1.1,
            color: "var(--text-primary)", letterSpacing: "-0.02em",
            marginBottom: "1.25rem",
          }}>
            Understand what<br />
            <span style={{
              background: "linear-gradient(135deg, var(--color-positive) 0%, var(--color-accent) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              people feel
            </span>
            , not just<br />what they say.
          </h1>

          <p style={{
            fontSize: "clamp(0.95rem, 2vw, 1.0625rem)",
            color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.75rem",
            maxWidth: 480,
          }}>
            NeuroSentix is a full-stack sentiment analysis platform. Paste text, upload CSVs, and instantly visualise whether your audience feels positive, negative, or neutral — backed by a real NLP model.
          </p>

          {/* Stats row */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "1.25rem",
            marginBottom: "2rem",
          }}>
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: "1.375rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => navigate("/analyze")}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.7rem 1.5rem",
                borderRadius: "var(--radius-md)",
                background: "var(--color-accent)", color: "#fff",
                border: "none", fontWeight: 700, fontSize: "0.9375rem",
                cursor: "pointer",
                transition: "transform var(--dur-fast) var(--ease-spring), box-shadow var(--dur-fast) var(--ease-out)",
                boxShadow: "0 4px 14px rgba(29,158,117,0.35)",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 20px rgba(29,158,117,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 14px rgba(29,158,117,0.35)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              Try Analyzer
            </button>

            <a href="#how-it-works" style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: "0.875rem", fontWeight: 600,
              color: "var(--text-secondary)", textDecoration: "none",
              transition: "color var(--dur-fast) var(--ease-out)",
            }}
            onMouseEnter={e => e.currentTarget.style.color="var(--text-primary)"}
            onMouseLeave={e => e.currentTarget.style.color="var(--text-secondary)"}
            >
              How it works →
            </a>
          </div>
        </div>

        {/* Right — Dashboard button + wake status */}
        <div style={{ animation: "fadeUp 0.6s var(--ease-out) 0.15s both" }}>
          <div style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)",
            padding: "2rem",
            boxShadow: "var(--shadow-lg)",
          }}>
            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                Go to Dashboard
              </h2>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)", lineHeight: 1.5 }}>
                {isReady
                  ? "The backend is live and ready. Open your dashboard now."
                  : "The backend is waking up on Render's free tier. This takes ~20–30s on first visit."}
              </p>
            </div>

            {/* The Dashboard button */}
            <button
              onClick={() => isReady && navigate("/dashboard")}
              disabled={!isReady}
              style={{
                width: "100%",
                padding: "0.875rem",
                borderRadius: "var(--radius-md)",
                border: `1.5px solid ${isReady ? "var(--color-positive)" : "var(--border-default)"}`,
                background: isReady ? "var(--color-positive)" : "var(--bg-surface)",
                color: isReady ? "#fff" : "var(--text-tertiary)",
                fontSize: "0.9375rem", fontWeight: 700,
                cursor: isReady ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                boxShadow: isReady ? "0 4px 16px rgba(83,74,183,0.25)" : "none",
                transform: "translateY(0)",
                position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => { if (isReady) { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(83,74,183,0.35)"; }}}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=isReady?"0 4px 16px rgba(83,74,183,0.25)":"none"; }}
            >
              {/* Shimmer on disabled */}
              {!isReady && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2s ease-in-out infinite",
                }}/>
              )}

              {isReady ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  </svg>
                  Open Dashboard
                </>
              ) : (
                <>
                  <span style={{
                    width: 16, height: 16,
                    border: "2px solid var(--border-default)",
                    borderTopColor: "var(--color-accent)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    display: "inline-block", flexShrink: 0,
                  }}/>
                  Waiting for server…
                </>
              )}
            </button>

            {/* Wake status panel */}
            <WakeStatus
              stageIdx={stageIdx}
              isReady={isReady}
              elapsed={elapsed}
              progress={progress}
            />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "4rem 1.25rem",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: "0.5rem" }}>
            Features
          </p>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Everything you need to read sentiment
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
          gap: "1rem",
        }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              boxShadow: "var(--shadow-sm)",
              transition: "box-shadow var(--dur-base) var(--ease-out), transform var(--dur-fast) var(--ease-spring)",
              animation: `fadeUp 0.5s var(--ease-out) ${i * 0.08}s both`,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow="var(--shadow-md)"; e.currentTarget.style.transform="translateY(-3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow="var(--shadow-sm)"; e.currentTarget.style.transform="translateY(0)"; }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: "var(--radius-md)",
                background: "var(--color-accent-light)",
                color: "var(--color-accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1rem",
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "0.8375rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "3rem 1.25rem 4rem",
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)",
          padding: "clamp(1.75rem, 4vw, 3rem)",
          boxShadow: "var(--shadow-md)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: "2.5rem",
          alignItems: "center",
        }}>
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: "0.75rem" }}>
              About the name
            </p>
            <h2 style={{ fontSize: "clamp(1.375rem, 3vw, 1.875rem)", fontWeight: 800, color: "var(--text-primary)", marginBottom: "1rem", letterSpacing: "-0.01em" }}>
              Why <span style={{ color: "var(--color-positive)" }}>NeuroSentix</span>?
            </h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.75, marginBottom: "1rem", fontSize: "0.9375rem" }}>
              <strong style={{ color: "var(--text-primary)" }}>Neuro</strong> — representing the neural network architecture at the core of the model. Modern sentiment classifiers are built on transformer-based deep learning, the same family of models powering large language models.
            </p>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.75, fontSize: "0.9375rem" }}>
              <strong style={{ color: "var(--text-primary)" }}>Sentix</strong> — a compact form of <em>sentiment analytics</em>. Together, the name reflects a system that thinks neurally about how language carries emotion.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {[
              { label: "Problem it solves", text: "Manually reading thousands of reviews, support tickets, or social posts is impossible at scale. NeuroSentix automates the emotional pulse-check.", color: "var(--color-positive)" },
              { label: "Who it helps", text: "Product teams, researchers, marketers, and developers who need to turn raw text into structured sentiment data quickly.", color: "var(--color-accent)" },
              { label: "What makes it different", text: "End-to-end — from raw text input to visual trend charts — in one lightweight, deployable full-stack app.", color: "var(--color-negative)" },
            ].map(item => (
              <div key={item.label} style={{
                padding: "1rem 1.25rem",
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-md)",
                borderLeft: `3px solid ${item.color}`,
              }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: item.color, marginBottom: 4 }}>
                  {item.label}
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 1.25rem 5rem",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-accent)", marginBottom: "0.5rem" }}>
            How it works
          </p>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            From raw text to insight in seconds
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: "1rem",
        }}>
          {[
            { step: "01", title: "Input text or CSV",    desc: "Paste a single review or upload a CSV with thousands of entries.", color: "var(--color-positive)" },
            { step: "02", title: "NLP model classifies", desc: "A fine-tuned transformer reads context, tone, and language patterns.", color: "var(--color-accent)" },
            { step: "03", title: "Score is assigned",    desc: "Each entry gets a Positive / Negative / Neutral label with a confidence score.", color: "var(--color-warning)" },
            { step: "04", title: "Dashboard visualises", desc: "Charts, trends, word clouds, and a searchable table bring data to life.", color: "var(--color-negative)" },
          ].map((s, i) => (
            <div key={s.step} style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              boxShadow: "var(--shadow-sm)",
              position: "relative",
              animation: `fadeUp 0.5s var(--ease-out) ${i * 0.1}s both`,
            }}>
              <div style={{
                fontSize: "2rem", fontWeight: 900, lineHeight: 1,
                color: "color-mix(in srgb, var(--border-default) 80%, transparent)",
                marginBottom: "0.75rem", fontVariantNumeric: "tabular-nums",
              }}>
                {s.step}
              </div>
              <div style={{ width: 28, height: 3, background: s.color, borderRadius: 99, marginBottom: "0.875rem" }}/>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>{s.title}</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "1.5rem 1.25rem",
        textAlign: "center",
        position: "relative", zIndex: 1,
      }}>
        <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
          Built with React · FastAPI · Render ·{" "}
          <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>NeuroSentix</span>
        </p>
      </footer>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes orbFloat {
          0%,100% { transform:translateY(0) scale(1); }
          50%      { transform:translateY(-32px) scale(1.04); }
        }
        @keyframes logoOrb {
          0%,100% { box-shadow:0 0 0 0 rgba(29,158,117,0.3); }
          50%      { box-shadow:0 0 0 10px rgba(29,158,117,0); }
        }
        @keyframes dotBounce {
          0%,80%,100% { transform:scale(0.6); opacity:0.4; }
          40%          { transform:scale(1);   opacity:1;   }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position:200% 0; }
          100% { background-position:-200% 0; }
        }
        @keyframes pulse-ring {
          0%   { box-shadow:0 0 0 0 rgba(29,158,117,0.4); }
          70%  { box-shadow:0 0 0 6px rgba(29,158,117,0); }
          100% { box-shadow:0 0 0 0 rgba(29,158,117,0); }
        }
      `}</style>
    </div>
  );
}
