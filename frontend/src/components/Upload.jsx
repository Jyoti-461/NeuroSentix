import { useState } from "react";
import { analyzeText, uploadCSV } from "../services/api";
import { useNavigate } from "react-router-dom";

function Upload() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);

  const navigate = useNavigate();

  // 🔹 Text Analysis
  const handleAnalyze = async () => {
    if (!text.trim()) return;

    try {
      const data = await analyzeText(text);
      setResult(data);
    } catch (error) {
      console.error(error);
    }
  };

  // 🔹 CSV Upload
  const handleCSVUpload = async () => {
    if (!file) return alert("Please select a CSV file");

    try {
      const res = await uploadCSV(file);
      alert(`Uploaded ${res.count} records successfully`);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Sentiment Analyzer
      </h1>

      {/* TEXT INPUT */}
      <textarea
        className="w-full p-3 border rounded mb-4"
        rows="4"
        placeholder="Enter text..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex gap-4 mb-6">
        <button
          onClick={handleAnalyze}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Analyze
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Go to Dashboard
        </button>
      </div>

      {/* RESULT */}
      {result && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <p><strong>Sentiment:</strong> {result.sentiment}</p>
          <p><strong>Score:</strong> {result.score}</p>
        </div>
      )}

      {/* CSV UPLOAD */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Upload CSV</h2>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />

        <button
          onClick={handleCSVUpload}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Upload CSV
        </button>
      </div>
    </div>
  );
}

export default Upload;