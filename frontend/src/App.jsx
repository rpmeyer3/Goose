import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import { MagicParticles, Parallax3DBackground } from "./components/MagicEffects";
import Home from "./pages/Home";
import Budget from "./pages/Budget";
import Chat from "./pages/Chat";
import About from "./pages/About";

const pageVariants = {
  initial: { opacity: 0, y: 20, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, filter: "blur(4px)", transition: { duration: 0.3 } },
};

export default function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-dark-wizard relative overflow-x-hidden wand-cursor-default">
      {!isMobile && <Parallax3DBackground />}
      {!isMobile && <MagicParticles count={25} />}
      <Navbar />
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Routes location={location}>
              <Route path="/" element={<Home setAnalysisData={setAnalysisData} />} />
              <Route path="/budget" element={<Budget data={analysisData} />} />
              <Route path="/chat" element={<Chat data={analysisData} />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
