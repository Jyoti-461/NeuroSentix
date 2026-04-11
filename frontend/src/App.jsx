import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Upload from "./components/Upload";
import Dashboard from "./components/Dashboard";
import AppLoader from "./components/AppLoader";
import Navbar from "./components/Navbar";

function App() {
  return (
    <AppLoader>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/analyze"  element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </AppLoader>
  );
}

export default App;
