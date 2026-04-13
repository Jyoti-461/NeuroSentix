import { NavLink } from "react-router-dom";

const menu = [
  { name: "User Preferences", path: "/settings/user" },
  { name: "Sentiment Model", path: "/settings/model" },
  { name: "Data Management", path: "/settings/data" },
  { name: "Dashboard Settings", path: "/settings/dashboard" },
  { name: "Upload Settings", path: "/settings/upload" },
  { name: "Notifications", path: "/settings/notifications" },
  { name: "Appearance", path: "/settings/appearance" },
  { name: "System", path: "/settings/system" },
];

export default function SettingsSidebar() {
  return (
    <div className="w-64 border-r border-[var(--border-subtle)] p-4 bg-[var(--bg-elevated)]">
      
      <h2 className="text-lg font-semibold mb-4">Settings</h2>

      <div className="flex flex-col gap-2">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm ${
                isActive
                  ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>

    </div>
  );
}