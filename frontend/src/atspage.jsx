import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { NavLink } from "react-router-dom";
import Backtbtn from "./back";
import "./atspage.css";

function Ats() {
  const [resume, setResume] = useState(null);
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState(null);

  function handelResume(e) {
    setResume(e.target.files[0]);
  }

  function handleDescription(e) {
    setDescription(e.target.value);
  }

  async function sendData(prompt) {
    if (!resume) { setResult("⚠ Please upload your resume before proceeding."); return; }
    if (!description.trim()) { setResult("⚠ Please provide a job description."); return; }

    setLoading(true);
    setActiveMode(prompt === 1 ? "hr" : "ats");
    setResult("");

    const formdata = new FormData();
    formdata.append("ATSdescription", description);
    formdata.append("prompt_number", prompt);
    formdata.append("file", resume);

    try {
      const session = JSON.parse(localStorage.getItem("session"));
      const token = session?.access_token;

      await axios.post("http://127.0.0.1:8000/ats/upload", formdata, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const response = await axios.post("http://127.0.0.1:8000/ats/analyze");
      setResult(response.data.result);
    } catch (err) {
      setResult("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ats-root">
      {/* Background grid */}
      <div className="ats-bg" aria-hidden="true" />

      {/* Header */}
      <header className="ats-header">
        <NavLink to="/" className="ats-back">
          <Backtbtn />
        </NavLink>
        <div className="ats-title-block">
          <span className="ats-eyebrow">Powered by Gemini 2.0 Flash</span>
          <h1 className="ats-title">Resume Intelligence</h1>
          <p className="ats-subtitle">ATS scoring &amp; HR perspective in seconds</p>
        </div>
      </header>

      {/* Main layout */}
      <main className="ats-main">
        {/* Left panel — inputs */}
        <section className="ats-panel ats-panel-left">
          {/* Upload */}
          <div className="ats-field-group">
            <label className="ats-label">
              <span className="ats-label-icon">📄</span>
              Resume
            </label>
            <label className="ats-upload-zone" htmlFor="resume-input">
              {resume ? (
                <span className="ats-upload-name">{resume.name}</span>
              ) : (
                <>
                  <span className="ats-upload-icon">↑</span>
                  <span className="ats-upload-hint">Drop PDF or click to upload</span>
                </>
              )}
              <input
                id="resume-input"
                type="file"
                accept=".pdf"
                onChange={handelResume}
                className="ats-file-input"
              />
            </label>
          </div>

          {/* Job Description */}
          <div className="ats-field-group ats-field-grow">
            <label className="ats-label" htmlFor="jd-textarea">
              <span className="ats-label-icon">📋</span>
              Job Description
            </label>
            <textarea
              id="jd-textarea"
              className="ats-textarea"
              placeholder="Paste the full job description here…"
              value={description}
              onChange={handleDescription}
            />
          </div>

          {/* Action buttons */}
          <div className="ats-actions">
            <button
              className={`ats-btn ats-btn-hr ${activeMode === "hr" && loading ? "ats-btn-loading" : ""}`}
              onClick={() => sendData(1)}
              disabled={loading}
            >
              <span className="ats-btn-icon">🧠</span>
              {loading && activeMode === "hr" ? "Analysing…" : "HR Thoughts"}
            </button>
            <button
              className={`ats-btn ats-btn-ats ${activeMode === "ats" && loading ? "ats-btn-loading" : ""}`}
              onClick={() => sendData(2)}
              disabled={loading}
            >
              <span className="ats-btn-icon">🎯</span>
              {loading && activeMode === "ats" ? "Scanning…" : "ATS Scan"}
            </button>
          </div>
        </section>

        {/* Right panel — results */}
        <section className="ats-panel ats-panel-right">
          <div className="ats-result-header">
            <span className="ats-result-title">
              {activeMode === "hr"
                ? "HR Feedback"
                : activeMode === "ats"
                ? "ATS Scan Results"
                : "Analysis Output"}
            </span>
            {result && !loading && (
              <span className="ats-result-badge">Complete</span>
            )}
            {loading && <span className="ats-pulse-dot" />}
          </div>

          <div className="ats-result-body">
            {loading ? (
              <div className="ats-skeleton">
                <div className="ats-sk-line ats-sk-w80" />
                <div className="ats-sk-line ats-sk-w60" />
                <div className="ats-sk-line ats-sk-w90" />
                <div className="ats-sk-line ats-sk-w50" />
                <div className="ats-sk-line ats-sk-w75" />
                <div className="ats-sk-line ats-sk-w65" />
              </div>
            ) : result ? (
              <div className="ats-markdown">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="ats-empty-state">
                <div className="ats-empty-icon">📊</div>
                <p className="ats-empty-heading">Ready to analyse</p>
                <p className="ats-empty-hint">
                  Upload your resume, paste the job description, then choose{" "}
                  <strong>HR Thoughts</strong> or <strong>ATS Scan</strong>.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Ats;