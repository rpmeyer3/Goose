import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { MagicParticles, Parallax3DBackground } from "./components/MagicEffects";
import LoadingOverlay from "./components/LoadingOverlay";

import Home from "./pages/Home";
import Budget from "./pages/Budget";
import Chat from "./pages/Chat";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";
import Statements from "./pages/Statements";
import Dashboard from "./pages/Dashboard";

const pageVariants = {
  initial: { opacity: 0, y: 20, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, filter: "blur(4px)", transition: { duration: 0.3 } },
};

export default function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Global loading state
  const location = useLocation();
  const navigate = useNavigate(); // Hook for navigation
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /**
   * Centralized File Upload Handler
   * This is passed to the Home page to trigger the loading screen
   */
  const handleFileUpload = async (file) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/api/analyze-statement", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Vault access denied");

      const result = await response.json();
      setAnalysisData(result); // Store data globally
      navigate("/budget");     // Redirect to dashboard
    } catch (error) {
      console.error("Vault Access Failed:", error);
      // You could add a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-wizard relative overflow-x-hidden wand-cursor-default">
      {/* 1. The Global Loading Screen */}
      <LoadingOverlay isLoading={isLoading} />

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
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Pass the handler to Home */}
              <Route
                path="/"
                element={
                  <Home
                    setAnalysisData={setAnalysisData}
                    onUpload={handleFileUpload}
                  />
                }
              />

              <Route
                path="/budget"
                element={
                  <ProtectedRoute>
                    <Budget data={analysisData} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat data={analysisData} />
                  </ProtectedRoute>
                }
              />
              <Route path="/about" element={<About />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/statements"
                element={
                  <ProtectedRoute>
                    <Statements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}