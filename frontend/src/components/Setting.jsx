import { useState } from "react";

const MENU = [
  { key: "model",         label: "Sentiment Model" },
  { key: "dashboard",     label: "Dashboard" },
  { key: "upload",        label: "Upload" },
  { key: "notifications", label: "Notifications" },
  { key: "appearance",    label: "Appearance" },
  { key: "system",        label: "System" },
];

function SentimentModel() {
  return (
    <div>
      <h1 className="text-base font-medium mb-4">Sentiment Model</h1>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-4">
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Model</label>
          <select className="w-full p-2 border border-[var(--border-subtle)] rounded-md text-sm bg-[var(--bg-primary)]">
            <option>VADER</option>
            <option>TextBlob</option>
            <option disabled>Transformer (coming soon)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Positive threshold</label>
          <input type="number" defaultValue="0.05" step="0.01"
            className="w-full p-2 border border-[var(--border-subtle)] rounded-md text-sm bg-[var(--bg-primary)]" />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Negative threshold</label>
          <input type="number" defaultValue="-0.05" step="0.01"
            className="w-full p-2 border border-[var(--border-subtle)] rounded-md text-sm bg-[var(--bg-primary)]" />
        </div>
      </div>
    </div>
  );
}

function DashboardSettings() {
  return (
    <div>
      <h1 className="text-base font-medium mb-4">Dashboard</h1>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-4">
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Default chart</label>
          <select className="w-full p-2 border border-[var(--border-subtle)] rounded-md text-sm bg-[var(--bg-primary)]">
            <option>Pie chart</option>
            <option>Line chart</option>
            <option>Bar chart</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4" />
          Show word cloud
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" className="w-4 h-4" />
          Show trend graph
        </label>
      </div>
    </div>
  );
}

function UploadSettings() {
  return (
    <div>
      <h1 className="text-base font-medium mb-4">Upload</h1>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-4">
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Text column name</label>
          <input type="text" placeholder="review"
            className="w-full p-2 border border-[var(--border-subtle)] rounded-md text-sm bg-[var(--bg-primary)]" />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4" />
          Skip empty rows
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4" />
          Remove duplicates
        </label>
      </div>
    </div>
  );
}

function Notifications() {
  return (
    <div>
      <h1 className="text-base font-medium mb-4">Notifications</h1>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" className="w-4 h-4" />
          Notify on negative spike
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" defaultChecked className="w-4 h-4" />
          Notify on upload complete
        </label>
      </div>
    </div>
  );
}

function Appearance() {
  const toggleTheme = () => {
    const root = document.documentElement;
    root.getAttribute("data-theme") === "dark"
      ? root.removeAttribute("data-theme")
      : root.setAttribute("data-theme", "dark");
  };
  return (
    <div>
      <h1 className="text-base font-medium mb-4">Appearance</h1>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-3">
        <p className="text-xs text-[var(--text-secondary)]">Toggle between light and dark mode.</p>
        <button onClick={toggleTheme}
          className="px-4 py-2 text-sm border border-[var(--border-subtle)] rounded-md bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
          Toggle dark mode
        </button>
      </div>
    </div>
  );
}

function SystemSettings() {
  return (
    <div>
      <h1 className="text-base font-medium mb-4">System</h1>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-4 space-y-4">
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">API base URL</label>
          <input type="text" value="https://neurosentix.onrender.com" readOnly
            className="w-full p-2 border border-[var(--border-subtle)] rounded-md text-sm bg-[var(--bg-primary)] opacity-60 cursor-default" />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Environment</label>
          <select className="w-full p-2 border border-[var(--border-subtle)] rounded-md text-sm bg-[var(--bg-primary)]">
            <option>Production</option>
            <option>Development</option>
          </select>
        </div>
      </div>
    </div>
  );
}

const PANELS = {
  model:         <SentimentModel />,
  dashboard:     <DashboardSettings />,
  upload:        <UploadSettings />,
  notifications: <Notifications />,
  appearance:    <Appearance />,
  system:        <SystemSettings />,
};

export default function Settings() {
  const [active, setActive] = useState("model");

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">

      {/* Sidebar */}
      <div className="w-52 flex-shrink-0 border-r border-[var(--border-subtle)] p-4 bg-[var(--bg-elevated)]">
        <h2 className="text-base font-medium mb-4 px-2">Settings</h2>
        <div className="flex flex-col gap-1">
          {MENU.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                active === item.key
                  ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-xl">
        {PANELS[active]}
      </div>

    </div>
  );
}
