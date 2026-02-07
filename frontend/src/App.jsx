import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Budget from "./pages/Budget";
import About from "./pages/About";

export default function App() {
  const [analysisData, setAnalysisData] = useState(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home setAnalysisData={setAnalysisData} />} />
          <Route path="/budget" element={<Budget data={analysisData} />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}
