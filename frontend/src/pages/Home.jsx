import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

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
      const res = await fetch("/api/analyze-statement", {
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
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-display font-bold text-center mb-2 text-wizard-gold drop-shadow-[0_0_12px_rgba(212,168,67,0.4)]">
        🪄 Cast Your Scroll
      </h1>
      <p className="text-center text-parchment/60 mb-10 font-serif italic">
        Present thy bank statement parchment and the enchantment shall reveal all hidden
        expenditures within.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
        className={`spell-card border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all duration-500 ${
          dragging
            ? "border-wizard-gold bg-wizard-gold/10 shadow-glow-lg"
            : "border-wizard-gold/30 hover:border-wizard-gold/60 hover:shadow-glow"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <div className="text-5xl mb-4 animate-float">📜</div>

        {file ? (
          <p className="text-wizard-gold font-display font-semibold">{file.name}</p>
        ) : (
          <>
            <p className="text-parchment/80 font-display font-semibold">
              Drag & drop your parchment here
            </p>
            <p className="text-sm text-parchment/40 mt-1 font-serif italic">or click to summon from thy archives</p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-wizard-crimson text-center font-serif">⚠️ {error}</p>
      )}

      <button
        onClick={upload}
        disabled={!file || uploading}
        className="mt-8 w-full py-3 rounded-xl font-display font-bold tracking-wider text-dark-wizard bg-gradient-to-r from-wizard-gold to-wizard-gold-light hover:from-wizard-gold-light hover:to-wizard-gold disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-glow hover:shadow-glow-lg"
      >
        {uploading ? "✨ Casting Spell…" : "⚡ Revelio!"}
      </button>
    </div>
  );
}
