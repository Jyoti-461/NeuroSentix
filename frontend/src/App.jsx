import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Upload from "./components/Upload";
import Dashboard from "./components/Dashboard";
import AppLoader from "./components/AppLoader";

function App() {
  return (
    <AppLoader>
      <Router>
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </AppLoader>
  );
}

export default App;