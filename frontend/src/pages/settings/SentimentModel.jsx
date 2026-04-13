export default function SentimentModel() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Sentiment Model</h1>

      <div className="bg-[var(--bg-elevated)] p-4 rounded-lg border border-[var(--border-subtle)] space-y-4">
        
        <div>
          <label className="text-sm">Select Model</label>
          <select className="w-full mt-1 p-2 border rounded">
            <option>VADER</option>
            <option>TextBlob</option>
            <option disabled>Transformer (Coming Soon)</option>
          </select>
        </div>

        <div>
          <label className="text-sm">Positive Threshold</label>
          <input type="number" defaultValue="0.05" className="w-full mt-1 p-2 border rounded" />
        </div>

        <div>
          <label className="text-sm">Negative Threshold</label>
          <input type="number" defaultValue="-0.05" className="w-full mt-1 p-2 border rounded" />
        </div>

      </div>
    </div>
  );
}