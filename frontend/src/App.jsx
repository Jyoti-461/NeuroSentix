import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home      from "./pages/Home";
import Upload    from "./components/Upload";
import Dashboard from "./components/Dashboard";
import Navbar    from "./components/Navbar";

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
            </Routes>
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;
