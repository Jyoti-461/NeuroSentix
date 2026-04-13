export default function Notifications() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Notifications</h1>

      <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-subtle)] space-y-4">

        <div>
          <label>
            <input type="checkbox" className="mr-2" />
            Notify on Negative Spike
          </label>
        </div>

        <div>
          <label>
            <input type="checkbox" className="mr-2" />
            Notify on Upload Complete
          </label>
        </div>

      </div>
    </div>
  );
}