import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

/* ─── Nav Items ─────────────────────────────────── */
const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    to: "/analyze",
    label: "Analyze",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
        <path d="M8 11h6M11 8v6" />
      </svg>
    ),
  },
  {
    to: "/history",
    label: "History",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </svg>
    ),
  },
  {
    to: "/reports",
    label: "Reports",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
        <line x1="8" y1="9" x2="10" y2="9" />
      </svg>
    ),
  },
  {
    to: "/settings",
    label: "Settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
      </svg>
    ),
  },
];

/* ─── Theme Toggle Button ─────────────────────── */
function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      style={{
        width: 40, height: 22,
        borderRadius: "99px",
        background: dark ? "var(--color-accent)" : "var(--border-default)",
        border: "none", cursor: "pointer", position: "relative",
        transition: "background var(--dur-base) var(--ease-out)",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: dark ? 20 : 2,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        transition: "left var(--dur-base) var(--ease-spring)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10,
      }}>
        {dark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}

/* ─── Logo ────────────────────────────────────── */
function Logo() {
  return (
    <NavLink to="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
      {/* Animated sentiment orb */}
      <div style={{ position: "relative", width: 32, height: 32, flexShrink: 0 }}>
  <div style={{
    width: 32, 
    height: 32, 
    borderRadius: "50%",
    // overflow: "hidden", // 🔴 Keeps it a perfect circle
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
        <div style={{ fontWeight: 800, fontSize: "0.975rem", lineHeight: 1.1, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          NeuroSentix
        </div>
        <div style={{ fontSize: "0.65rem", fontWeight: 500, color: "var(--text-tertiary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Analysis
        </div>
      </div>
    </NavLink>
  );
}

/* ─── NAVBAR ──────────────────────────────────── */
function Navbar() {
  const [dark, setDark]           = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [mobileLabel, setMobileLabel] = useState(null); // for mobile tooltip
  const rippleRefs                = useRef({});
  const location                  = useLocation();

  /* dark mode */
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (!saved && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  /* scroll effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ripple on mobile tap */
  const triggerRipple = (key, e) => {
    const el = rippleRefs.current[key];
    if (!el) return;
    const r = document.createElement("span");
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    r.style.cssText = `
      position:absolute; border-radius:50%; pointer-events:none;
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      background: var(--color-accent-light);
      animation: rippleAnim 0.5s ease-out forwards;
    `;
    el.appendChild(r);
    setTimeout(() => r.remove(), 520);
  };

  const activeItem = NAV_ITEMS.find((n) => location.pathname === n.to);

  return (
    <>
      {/* ── DESKTOP NAV ─────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: scrolled
          ? "color-mix(in srgb, var(--bg-elevated) 92%, transparent)"
          : "var(--bg-elevated)",
        borderBottom: "1px solid var(--border-subtle)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        transition: "background var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "0 1.25rem",
          height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem",
        }}>
          <Logo />

          {/* Desktop links */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flex: 1, justifyContent: "center" }}
               className="desktop-nav-links">
            {NAV_ITEMS.map(({ to, label, icon }) => (
              <NavLink key={to} to={to} style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "0.375rem",
                padding: "0.425rem 0.875rem", borderRadius: "var(--radius-md)",
                fontSize: "0.875rem", fontWeight: isActive ? 600 : 450,
                color: isActive ? "var(--color-accent)" : "var(--text-secondary)",
                background: isActive ? "var(--color-accent-light)" : "transparent",
                textDecoration: "none",
                border: `1.5px solid ${isActive ? "color-mix(in srgb, var(--color-accent) 30%, transparent)" : "transparent"}`,
                transition: "all var(--dur-fast) var(--ease-out)",
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.classList.contains("active")) {
                  e.currentTarget.style.background = "var(--bg-overlay)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={e => {
                const isActive = location.pathname === to;
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
              >
                <span style={{ width: 16, height: 16, flexShrink: 0 }}>
                  {/* Re-render icon at 16px */}
                  {icon}
                </span>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <ThemeToggle dark={dark} onToggle={toggleTheme} />
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "var(--color-positive-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.875rem", fontWeight: 700, color: "var(--color-positive-dark)",
              cursor: "pointer", flexShrink: 0,
              border: "2px solid var(--color-positive)",
            }}>S</div>
          </div>
        </div>
      </nav>

      {/* ── MOBILE BOTTOM NAV ────────────────────── */}
      {/* Spacer so content isn't hidden behind bottom nav */}
      <div className="mobile-bottom-spacer" />

      <nav className="mobile-bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50 }}>
        {/* Blurred glass background */}
        <div style={{
          position: "absolute", inset: 0,
          background: "var(--bg-elevated)",
          borderTop: "1px solid var(--border-subtle)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }} />

        {/* Active tab indicator pill (slides under active tab) */}
        <div style={{
          position: "absolute",
          top: 0,
          left: `calc(${NAV_ITEMS.findIndex(n => n.to === location.pathname)} * 20%)`,
          width: "20%",
          height: "2px",
          background: "var(--color-accent)",
          borderRadius: "0 0 2px 2px",
          transition: "left 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }} />

        {/* Nav items */}
        <div style={{
          position: "relative",
          display: "flex",
          alignItems: "stretch",
          height: "calc(60px + env(safe-area-inset-bottom, 0px))",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}>
          {NAV_ITEMS.map(({ to, label, icon }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                ref={el => rippleRefs.current[to] = el}
                onClick={(e) => {
                  triggerRipple(to, e);
                  setMobileLabel(label);
                  setTimeout(() => setMobileLabel(null), 1200);
                }}
                style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: "3px", textDecoration: "none",
                  position: "relative", overflow: "hidden",
                  transition: "transform var(--dur-fast) var(--ease-spring)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {/* Icon container with bounce effect */}
                <div style={{
                  width: 40, height: 36, borderRadius: "var(--radius-md)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isActive ? "var(--color-accent-light)" : "transparent",
                  color: isActive ? "var(--color-accent)" : "var(--text-tertiary)",
                  transition: "all var(--dur-base) var(--ease-spring)",
                  transform: isActive ? "translateY(-2px) scale(1.06)" : "translateY(0) scale(1)",
                }}>
                  {icon}
                  {/* Active dot */}
                  {isActive && (
                    <span style={{
                      position: "absolute", bottom: 4, left: "50%",
                      transform: "translateX(-50%)",
                      width: 4, height: 4, borderRadius: "50%",
                      background: "var(--color-accent)",
                      animation: "dotPop 0.3s var(--ease-spring) forwards",
                    }} />
                  )}
                </div>

                {/* Label */}
                <span style={{
                  fontSize: "0.6rem", fontWeight: isActive ? 700 : 500,
                  letterSpacing: "0.04em",
                  color: isActive ? "var(--color-accent)" : "var(--text-tertiary)",
                  transition: "color var(--dur-fast) var(--ease-out)",
                  lineHeight: 1,
                }}>
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* ── Keyframes & Responsive CSS ───────────── */}
      <style>{`
        @keyframes logoOrb {
          0%, 100% { box-shadow: 0 0 0 0 var(--color-accent-light); }
          50%       { box-shadow: 0 0 0 8px transparent; }
        }
        @keyframes rippleAnim {
          from { transform: scale(0); opacity: 0.5; }
          to   { transform: scale(1); opacity: 0; }
        }
        @keyframes dotPop {
          0%   { transform: translateX(-50%) scale(0); }
          60%  { transform: translateX(-50%) scale(1.5); }
          100% { transform: translateX(-50%) scale(1); }
        }
        @keyframes toastSlide {
          0%   { opacity:0; transform: translateY(8px) scale(0.95); }
          20%  { opacity:1; transform: translateY(0) scale(1); }
          80%  { opacity:1; transform: translateY(0) scale(1); }
          100% { opacity:0; transform: translateY(-8px) scale(0.95); }
        }

        /* Hide mobile nav on desktop, show on mobile */
        .mobile-bottom-nav    { display: none; }
        .mobile-bottom-spacer { display: none; }
        .desktop-nav-links    { display: flex !important; }

        @media (max-width: 767px) {
          .mobile-bottom-nav    { display: block; }
          .mobile-bottom-spacer { display: block; height: calc(60px + env(safe-area-inset-bottom, 0px)); }
          .desktop-nav-links    { display: none !important; }
        }

        /* Tap feedback */
        .mobile-bottom-nav a:active {
          transform: scale(0.92);
        }
      `}</style>
    </>
  );
}

export default Navbar;
