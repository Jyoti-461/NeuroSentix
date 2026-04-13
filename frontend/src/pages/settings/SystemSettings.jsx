export default function SystemSettings() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">System Settings</h1>

      <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-subtle)] space-y-4">

        <div>
          <label className="text-sm">API Base URL</label>
          <input
            type="text"
            value="https://neurosentix.onrender.com"
            readOnly
            className="w-full mt-1 p-2 border rounded"
          />
        </div>

        <div>
          <label className="text-sm">Environment</label>
          <select className="w-full mt-1 p-2 border rounded">
            <option>Production</option>
            <option>Development</option>
          </select>
        </div>

      </div>
    </div>
  );
}