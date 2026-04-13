import { useState } from "react";

import UserPreferences from "../pages/settings/UserPreferences";
import SentimentModel from "../pages/settings/SentimentModel";
import DataManagement from "../pages/settings/DataManagement";
import DashboardSettings from "../pages/settings/DashboardSettings";
import UploadSettings from "../pages/settings/UploadSettings";
import Notifications from "../pages/settings/Notifications";
import Appearance from "../pages/settings/Appearance";
import SystemSettings from "../pages/settings/SystemSettings";


const MENU = [
  { key: "user", label: "User Preferences" },
  { key: "model", label: "Sentiment Model" },
  { key: "data", label: "Data Management" },
  { key: "dashboard", label: "Dashboard Settings" },
  { key: "upload", label: "Upload Settings" },
  { key: "notifications", label: "Notifications" },
  { key: "appearance", label: "Appearance" },
  { key: "system", label: "System" },
];

export default function Settings() {
  const [active, setActive] = useState("user");

  // 🔹 Render selected component
  const renderContent = () => {
    switch (active) {
      case "user":
        return <UserPreferences />;
      case "model":
        return <SentimentModel />;
      case "data":
        return <DataManagement />;
      case "dashboard":
        return <DashboardSettings />;
      case "upload":
        return <UploadSettings />;
      case "notifications":
        return <Notifications />;
      case "appearance":
        return <Appearance />;
      case "system":
        return <SystemSettings />;
      default:
        return <UserPreferences />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* 🔥 SIDEBAR */}
      <div
        style={{
          width: "260px",
          borderRight: "1px solid var(--border-subtle)",
          padding: "20px",
          background: "var(--bg-elevated)",
        }}
      >
        <h2 style={{ marginBottom: "20px", fontSize: "18px" }}>
          Settings
        </h2>

        {MENU.map((item) => (
          <div
            key={item.key}
            onClick={() => setActive(item.key)}
            style={{
              padding: "10px 12px",
              marginBottom: "6px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              background:
                active === item.key
                  ? "var(--bg-secondary)"
                  : "transparent",
              color:
                active === item.key
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              transition: "0.2s",
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* 🔥 CONTENT */}
      <div style={{ flex: 1, padding: "24px" }}>
        {renderContent()}
      </div>
    </div>
  );
}