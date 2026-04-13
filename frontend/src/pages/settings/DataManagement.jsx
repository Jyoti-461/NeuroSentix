export default function DataManagement() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Data Management</h1>

      <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-subtle)] space-y-4">

        <button className="px-4 py-2 bg-red-500 text-white rounded">
          Clear All Data
        </button>

        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          Export Data (CSV)
        </button>

        <div>
          <label className="text-sm">Auto Delete After (Days)</label>
          <input type="number" placeholder="30" className="w-full mt-1 p-2 border rounded" />
        </div>

      </div>
    </div>
  );
}