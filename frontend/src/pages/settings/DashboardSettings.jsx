export default function DashboardSettings() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Dashboard Settings</h1>

      <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-subtle)] space-y-4">

        <div>
          <label className="text-sm">Default Chart</label>
          <select className="w-full mt-1 p-2 border rounded">
            <option>Pie Chart</option>
            <option>Line Chart</option>
            <option>Bar Chart</option>
          </select>
        </div>

        <div>
          <label>
            <input type="checkbox" className="mr-2" />
            Show Word Cloud
          </label>
        </div>

        <div>
          <label>
            <input type="checkbox" className="mr-2" />
            Show Trend Graph
          </label>
        </div>

      </div>
    </div>
  );
}