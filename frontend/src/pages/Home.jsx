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
      <h1 className="text-3xl font-bold text-center mb-2">
        Analyze Your Statement
      </h1>
      <p className="text-center text-gray-500 mb-10">
        Upload a bank statement PDF to get a full spending breakdown.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
        className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-400 bg-white"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <svg
          className="mx-auto mb-4 h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16v-8m0 0l-3 3m3-3l3 3M3.75 19.5h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
          />
        </svg>

        {file ? (
          <p className="text-indigo-600 font-medium">{file.name}</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium">
              Drag & drop your PDF here
            </p>
            <p className="text-sm text-gray-400 mt-1">or click to browse</p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
      )}

      <button
        onClick={upload}
        disabled={!file || uploading}
        className="mt-8 w-full py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? "Analyzing…" : "Upload & Analyze"}
      </button>
    </div>
  );
}
