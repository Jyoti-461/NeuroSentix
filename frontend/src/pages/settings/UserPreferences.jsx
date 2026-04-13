export default function UserPreferences() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">
        User Preferences
      </h1>

      <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-subtle)]">
        
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Customize your experience
        </p>

        {/* Theme Toggle Example */}
        <button
          onClick={() => {
            const current = document.documentElement.getAttribute("data-theme");
            if (current === "dark") {
              document.documentElement.removeAttribute("data-theme");
            } else {
              document.documentElement.setAttribute("data-theme", "dark");
            }
          }}
          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-md"
        >
          Toggle Dark Mode
        </button>

      </div>
    </div>
  );
}