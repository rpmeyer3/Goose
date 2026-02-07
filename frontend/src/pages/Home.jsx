import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TypeWriter, FadeInSection, MagicSpinner } from "../components/MagicEffects";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function Home({ setAnalysisData }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef();
  const navigate = useNavigate();

  function handleFile(f) {
    setError("");
    if (f && f.type === "application/pdf") {
      setFile(f);
    } else {
      setError("Please select a valid PDF file.");
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    handleFile(dropped);
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/analyze-statement`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || `Server error ${res.status}`);
      }

      const data = await res.json();
      setAnalysisData(data);
      navigate("/budget");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative">
      {/* Hero section with typewriter */}
      <FadeInSection>
        <motion.div
          className="text-center mb-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <motion.div
            className="text-4xl sm:text-6xl mb-4 sm:mb-6"
            animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            🪄
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-center mb-3 text-wizard-gold drop-shadow-[0_0_12px_rgba(212,168,67,0.4)]">
            Cast Your Scroll
          </h1>
          <div className="h-8 flex items-center justify-center">
            <TypeWriter
              words={["Revelio Expenditures", "Unlock Hidden Galleons", "Decode Thy Parchment", "Summon Thy Vault"]}
              className="text-lg font-serif italic text-wizard-gold-light/70"
            />
          </div>
        </motion.div>
      </FadeInSection>

      <FadeInSection delay={0.15}>
        <p className="text-center text-parchment/50 mb-10 font-serif italic max-w-md mx-auto">
          Present thy bank statement parchment and the enchantment shall reveal all hidden
          expenditures within.
        </p>
      </FadeInSection>

      {/* Upload drop zone */}
      <FadeInSection delay={0.3}>
        <motion.div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current.click()}
          whileHover={{ scale: 1.01, boxShadow: "0 0 40px rgba(212, 168, 67, 0.3)" }}
          whileTap={{ scale: 0.99 }}
          className={`spell-card border-2 border-dashed rounded-2xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-500 ${
            dragging
              ? "border-wizard-gold bg-wizard-gold/10 shadow-glow-lg"
              : "border-wizard-gold/30 hover:border-wizard-gold/60"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          <motion.div
            className="text-4xl sm:text-5xl mb-4"
            animate={{
              y: [0, -15, 0],
              rotateZ: [0, 5, -5, 0],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            📜
          </motion.div>

          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="file"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-wizard-gold font-display font-semibold"
              >
                <span className="inline-block mr-2">✨</span>
                {file.name}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-parchment/80 font-display font-semibold">
                  Drag & drop your parchment here
                </p>
                <p className="text-sm text-parchment/40 mt-1 font-serif italic">or click to summon from thy archives</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </FadeInSection>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 text-sm text-wizard-crimson text-center font-serif"
          >
            ⚠️ {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Upload button */}
      <FadeInSection delay={0.45}>
        <motion.button
          onClick={upload}
          disabled={!file || uploading}
          whileHover={!uploading && file ? { scale: 1.03, boxShadow: "0 0 40px rgba(212, 168, 67, 0.5)" } : {}}
          whileTap={!uploading && file ? { scale: 0.97 } : {}}
          className="mt-8 w-full py-4 rounded-xl font-display font-bold tracking-wider text-dark-wizard bg-gradient-to-r from-wizard-gold to-wizard-gold-light hover:from-wizard-gold-light hover:to-wizard-gold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-glow wand-trail text-lg"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-3">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block"
              >
                ✨
              </motion.span>
              Casting Spell…
            </span>
          ) : (
            "⚡ Revelio!"
          )}
        </motion.button>
      </FadeInSection>

      {/* Feature highlights */}
      <FadeInSection delay={0.6}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-10 sm:mt-14">
          {[
            { icon: "🔐", title: "Secure", desc: "Scrolls vanish after analysis" },
            { icon: "🤖", title: "ML Powered", desc: "Sorting charm AI" },
            { icon: "⚡", title: "Instant", desc: "Results in seconds" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.15 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="spell-card rounded-xl p-4 text-center"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="font-display text-xs font-semibold text-wizard-gold mb-1">{f.title}</p>
              <p className="text-xs text-parchment/40 font-serif">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </FadeInSection>
    </div>
  );
}
