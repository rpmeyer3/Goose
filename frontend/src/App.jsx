import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Budget from "./pages/Budget";

export default function App() {
  const [analysisData, setAnalysisData] = useState(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home setAnalysisData={setAnalysisData} />} />
          <Route path="/budget" element={<Budget data={analysisData} />} />
        </Routes>
      </main>
    </div>
  );
}
