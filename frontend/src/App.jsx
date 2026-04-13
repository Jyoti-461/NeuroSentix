import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home      from "./pages/Home";
import Upload    from "./components/Upload";
import Dashboard from "./components/Dashboard";
import Navbar    from "./components/Navbar";
import History from "./components/History"; // We will create this below
import Setting from "./components/Setting"; // Placeholder for future settings page
import Reports from "./components/Reports"; // Placeholder for future reports page

function App() {
  return (
    <Router>
      <Routes>
        
        {/* Home is standalone — has its own header, no Navbar */}
        <Route path="/" element={<Home />} />
        
        {/* App pages share the Navbar */}
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analyze"   element={<Upload />} />
              <Route path="/history"   element={<History />} />
              <Route path="/settings"  element={<Setting />} />
              <Route path="/reports"   element={<Reports />} />
            </Routes>
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;
