import { useEffect, useState } from "react";
import { fetchAllData } from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function Dashboard() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [wcLoaded, setWcLoaded] = useState(false);
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetchAllData();
      setData(res);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ FILTERED DATA (FIXED ORDER + SAFE TEXT)
  const filteredData = data.filter((item) => {
    const matchesSentiment =
      filter === "All" || item.sentiment === filter;

    const matchesSearch =
      (item.text || "").toLowerCase().includes(search.toLowerCase());

    return matchesSentiment && matchesSearch;
  });

  // ✅ SENTIMENT COUNT
  const sentimentCount = {
    Positive: 0,
    Negative: 0,
    Neutral: 0,
  };

  filteredData.forEach((item) => {
    if (item.sentiment) {
      sentimentCount[item.sentiment]++;
    }
  });

  // ✅ PIE CHART DATA
  const chartData = [
    { name: "Positive", value: sentimentCount.Positive },
    { name: "Negative", value: sentimentCount.Negative },
    { name: "Neutral", value: sentimentCount.Neutral },
  ];

  const COLORS = ["#22c55e", "#ef4444", "#eab308"];

  // ✅ TREND DATA
  const trendMap = {};

  filteredData.forEach((item) => {
    const date = item.created_at
      ? new Date(item.created_at).toLocaleDateString()
      : "Unknown";

    if (!trendMap[date]) {
      trendMap[date] = { date, count: 0 };
    }

    trendMap[date].count++;
  });

  const trendData = Object.values(trendMap);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* FILTERS */}
      <div className="flex gap-4 mb-6">
        <select
          className="border p-2"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Positive">Positive</option>
          <option value="Negative">Negative</option>
          <option value="Neutral">Neutral</option>
        </select>

        <input
          type="text"
          placeholder="Search text..."
          className="border p-2 flex-1"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* EMPTY STATE */}
      {filteredData.length === 0 && (
        <p className="text-gray-500 mb-4">No data found</p>
      )}

      {/* CHARTS */}
      <div className="flex flex-wrap gap-10">

        {/* PIE CHART */}
        <PieChart width={400} height={400}>
          <Pie
            data={chartData}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>

        {/* LINE CHART */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Sentiment Trend
          </h2>

          <LineChart width={500} height={300} data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" />
          </LineChart>
        </div>
      </div>
      {/* WORD CLOUD */}
      <div className="mt-10">
  <h2 className="text-xl font-semibold mb-4">Word Cloud</h2>

  {!wcLoaded && <p>Generating word cloud...</p>}

  <img
    src={`${import.meta.env.VITE_BACKEND_URL}/wordcloud`}
    alt="Word Cloud"
    className="border rounded"
    onLoad={() => setWcLoaded(true)}
  />
</div>
{/* src="http://127.0.0.1:8000/wordcloud" */}

      {/* TABLE */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">All Reviews</h2>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Text</th>
              <th className="p-2 border">Sentiment</th>
              <th className="p-2 border">Score</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td className="p-2 border">{item.text}</td>
                <td className="p-2 border">{item.sentiment}</td>
                <td className="p-2 border">{item.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;