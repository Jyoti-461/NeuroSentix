import SettingsSidebar from "./SettingsSidebar";

export default function SettingsLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      
      {/* Sidebar */}
      <SettingsSidebar />

      {/* Content */}
      <div className="flex-1 p-6">
        {children}
      </div>

    </div>
  );
}