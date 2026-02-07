import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadBankStatement } from '../services/api.tsx';
import type {UploadResponse} from '../types';
import '../styles/UploadPage.css';

const UploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const response: UploadResponse = await uploadBankStatement(file);

      // Navigate to dashboard with the analysis data
      navigate('/dashboard', {
        state: {
          analysisData: response,
          filename: response.filename
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <div className="header">
          <h1 className="title">🧙‍♂️ Wizarding Bank Statement Analyzer</h1>
          <p className="subtitle">Upload your Gringotts statement to reveal your magical spending patterns</p>
        </div>

        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleChange}
            style={{ display: 'none' }}
          />

          {!file ? (
            <div className="upload-prompt">
              <div className="upload-icon">📄</div>
              <h3>Drop your bank statement here</h3>
              <p>or</p>
              <button className="browse-button" onClick={onButtonClick}>
                Browse Files
              </button>
              <p className="file-info">PDF files only • Max 10MB</p>
            </div>
          ) : (
            <div className="file-preview">
              <div className="file-icon">✨</div>
              <div className="file-details">
                <h3>{file.name}</h3>
                <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                className="remove-button"
                onClick={() => setFile(null)}
                disabled={uploading}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        <button
          className="analyze-button"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? (
            <>
              <span className="spinner"></span>
              Analyzing magical transactions...
            </>
          ) : (
            '✨ Analyze Statement'
          )}
        </button>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">🧪</span>
            <span>Automatic categorization</span>
          </div>
          <div className="feature">
            <span className="feature-icon">📊</span>
            <span>Spending insights</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔮</span>
            <span>AI-powered analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;