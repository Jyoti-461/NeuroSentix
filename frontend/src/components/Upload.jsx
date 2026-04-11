import { useState, useRef } from "react";
import { analyzeText, uploadCSV } from "../services/api";
import { useNavigate } from "react-router-dom";

/* ─── Sentiment config ─────────────────── */
const SENTIMENT_CONFIG = {
  Positive: { color: "var(--color-positive)", bg: "var(--color-positive-light)", dark: "var(--color-positive-dark)", icon: "↑", label: "Positive" },
  Negative: { color: "var(--color-negative)", bg: "var(--color-negative-light)", dark: "var(--color-negative-dark)", icon: "↓", label: "Negative" },
  Neutral:  { color: "var(--color-neutral)",  bg: "var(--color-neutral-light)",  dark: "var(--color-neutral)",      icon: "→", label: "Neutral"  },
};

/* ─── Score Bar ────────────────────────── */
function ScoreBar({ score, sentiment }) {
  const cfg = SENTIMENT_CONFIG[sentiment] || {};
  const pct = Math.min(Math.max((score || 0) * 100, 0), 100);
  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Confidence
        </span>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: cfg.color }}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div style={{ height: 8, background: "var(--bg-surface)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          background: cfg.color,
          width: `${pct}%`,
          transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
    </div>
  );
}

/* ─── Upload Page ──────────────────────── */
function Upload() {
  const [text, setText]           = useState("");
  const [result, setResult]       = useState(null);
  const [file, setFile]           = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null); // { type: "success"|"error", text }
  const [dragOver, setDragOver]   = useState(false);
  const fileInputRef              = useRef(null);
  const navigate                  = useNavigate();

  /* ── Text Analysis ── */
  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const data = await analyzeText(text);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  /* ── CSV Upload ── */
  const handleCSVUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      const res = await uploadCSV(file);
      setUploadMsg({ type: "success", text: `${res.count} records uploaded successfully` });
    } catch (err) {
      console.error(err);
      setUploadMsg({ type: "error", text: "Upload failed. Please check your file and try again." });
    } finally {
      setUploading(false);
    }
  };

  /* ── Drag & Drop ── */
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".csv")) setFile(dropped);
  };

  const cfg = result ? SENTIMENT_CONFIG[result.sentiment] : null;

  /* ── Shared styles ── */
  const sectionCard = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-sm)",
    padding: "1.75rem",
    marginBottom: "1.25rem",
  };

  const sectionLabel = {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--text-tertiary)",
    marginBottom: "0.875rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  };

  const labelAccent = {
    width: 3, height: "1em", borderRadius: 2,
    background: "var(--color-accent)", display: "inline-block",
  };

  return (
    <div style={{
      background: "var(--bg-primary)",
      minHeight: "100dvh",
      padding: "1.5rem 1rem 4rem",
    }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* ── Page Title ── */}
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{
            fontSize: "clamp(1.375rem, 3vw, 1.875rem)",
            fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}>
            Analyze Sentiment
          </h1>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem", marginTop: 4 }}>
            Paste text below or upload a CSV to batch-analyze sentiment.
          </p>
        </div>

        {/* ── Text Analysis Card ── */}
        <div style={sectionCard}>
          <p style={sectionLabel}><span style={labelAccent} />Text Analysis</p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text here to analyze its sentiment…"
            rows={5}
            style={{
              width: "100%", resize: "vertical",
              padding: "0.875rem 1rem",
              fontSize: "0.9375rem", lineHeight: 1.6,
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              border: "1.5px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              outline: "none",
              transition: "border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
              fontFamily: "var(--font-sans)",
            }}
            onFocus={e => {
              e.target.style.borderColor = "var(--color-accent)";
              e.target.style.boxShadow = "0 0 0 3px var(--color-accent-light)";
            }}
            onBlur={e => {
              e.target.style.borderColor = "var(--border-default)";
              e.target.style.boxShadow = "none";
            }}
          />

          {/* Char count */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
              {text.length} characters
            </span>
            <div style={{ display: "flex", gap: "0.625rem" }}>
              {text && (
                <button onClick={() => { setText(""); setResult(null); }} style={{
                  fontSize: "0.8125rem", padding: "0.45rem 0.875rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)", background: "transparent",
                  cursor: "pointer",
                  transition: "background var(--dur-fast) var(--ease-out)",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-surface)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  Clear
                </button>
              )}
              <button
                onClick={handleAnalyze}
                disabled={!text.trim() || analyzing}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  fontSize: "0.875rem", fontWeight: 600,
                  padding: "0.5rem 1.25rem",
                  borderRadius: "var(--radius-md)",
                  background: text.trim() ? "var(--color-accent)" : "var(--border-default)",
                  color: "#fff", border: "none", cursor: text.trim() ? "pointer" : "not-allowed",
                  transition: "background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-spring)",
                  opacity: analyzing ? 0.75 : 1,
                }}
                onMouseEnter={e => { if (text.trim() && !analyzing) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {analyzing ? (
                  <>
                    <span style={{
                      width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      animation: "spin 0.7s linear infinite", display: "inline-block", flexShrink: 0,
                    }} />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                    Analyze
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Result Card ── */}
        {result && cfg && (
          <div style={{
            background: cfg.bg,
            border: `1.5px solid ${cfg.color}`,
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem 1.75rem",
            marginBottom: "1.25rem",
            animation: "fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: cfg.color }}>
                Result
              </p>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: "0.8125rem", fontWeight: 700,
                padding: "0.3rem 0.875rem", borderRadius: "99px",
                background: cfg.color, color: "#fff",
                letterSpacing: "0.04em",
              }}>
                {cfg.icon} {result.sentiment}
              </span>
            </div>

            <ScoreBar score={result.score} sentiment={result.sentiment} />

            <div style={{
              marginTop: "1rem", padding: "0.75rem 1rem",
              background: "var(--bg-elevated)", borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
            }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 600, marginBottom: 4 }}>Analyzed text</p>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {text.length > 200 ? text.slice(0, 200) + "…" : text}
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              style={{
                marginTop: "1rem", width: "100%",
                padding: "0.6rem", borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-surface)"; e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
              </svg>
              View Dashboard
            </button>
          </div>
        )}

        {/* ── CSV Upload Card ── */}
        <div style={sectionCard}>
          <p style={sectionLabel}><span style={labelAccent} />Batch CSV Upload</p>

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? "var(--color-accent)" : file ? "var(--color-positive)" : "var(--border-default)"}`,
              borderRadius: "var(--radius-md)",
              background: dragOver ? "var(--color-accent-light)" : file ? "var(--color-positive-light)" : "var(--bg-primary)",
              padding: "2rem 1rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all var(--dur-base) var(--ease-out)",
              marginBottom: "1rem",
            }}
          >
            <div style={{ marginBottom: "0.5rem" }}>
              {file ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-positive)" strokeWidth="1.75" strokeLinecap="round" style={{ margin: "0 auto" }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <polyline points="9 15 11 17 15 13"/>
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.75" strokeLinecap="round" style={{ margin: "0 auto" }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              )}
            </div>

            {file ? (
              <>
                <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-positive-dark)" }}>{file.name}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 3 }}>
                  {(file.size / 1024).toFixed(1)} KB · Click to change
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                  Drop your CSV here or <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>browse</span>
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 3 }}>
                  Only .csv files accepted
                </p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => { setFile(e.target.files[0]); setUploadMsg(null); }}
            style={{ display: "none" }}
          />

          {/* Upload feedback */}
          {uploadMsg && (
            <div style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "0.875rem",
              background: uploadMsg.type === "success" ? "var(--color-positive-light)" : "var(--color-negative-light)",
              border: `1px solid ${uploadMsg.type === "success" ? "var(--color-positive)" : "var(--color-negative)"}`,
              color: uploadMsg.type === "success" ? "var(--color-positive-dark)" : "var(--color-negative-dark)",
              fontSize: "0.875rem", fontWeight: 500,
              display: "flex", alignItems: "center", gap: 8,
              animation: "fadeUp 0.3s var(--ease-out) both",
            }}>
              {uploadMsg.type === "success" ? "✓" : "✕"} {uploadMsg.text}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.625rem" }}>
            <button
              onClick={handleCSVUpload}
              disabled={!file || uploading}
              style={{
                flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                padding: "0.6rem 1rem", borderRadius: "var(--radius-md)",
                fontSize: "0.875rem", fontWeight: 600,
                background: file ? "var(--color-positive)" : "var(--border-default)",
                color: "#fff", border: "none",
                cursor: file && !uploading ? "pointer" : "not-allowed",
                opacity: uploading ? 0.75 : 1,
                transition: "background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-spring)",
              }}
              onMouseEnter={e => { if (file && !uploading) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {uploading ? (
                <>
                  <span style={{
                    width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite", display: "inline-block", flexShrink: 0,
                  }} />
                  Uploading…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Upload CSV
                </>
              )}
            </button>

            {file && (
              <button
                onClick={() => { setFile(null); setUploadMsg(null); }}
                style={{
                  padding: "0.6rem 0.875rem", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-default)",
                  background: "transparent", color: "var(--text-tertiary)",
                  fontSize: "0.875rem", cursor: "pointer",
                  transition: "background var(--dur-fast) var(--ease-out)",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-surface)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* ── Bottom nav hint ── */}
        <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "var(--text-tertiary)", marginTop: "0.5rem" }}>
          After uploading, view all results on the{" "}
          <span
            onClick={() => navigate("/dashboard")}
            style={{ color: "var(--color-accent)", fontWeight: 600, cursor: "pointer" }}
          >
            Dashboard
          </span>
        </p>

      </div>
    </div>
  );
}

export default Upload;
