export default function UploadSettings() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Upload Settings</h1>

      <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-subtle)] space-y-4">

        <div>
          <label className="text-sm">Text Column Name</label>
          <input type="text" placeholder="review" className="w-full mt-1 p-2 border rounded" />
        </div>

        <div>
          <label>
            <input type="checkbox" className="mr-2" />
            Skip Empty Rows
          </label>
        </div>

        <div>
          <label>
            <input type="checkbox" className="mr-2" />
            Remove Duplicates
          </label>
        </div>

      </div>
    </div>
  );
}