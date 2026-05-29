import React, { useRef, useState, useEffect } from "react";
import Video from './components/video';
import { NavLink, useParams } from "react-router-dom";
import "./interview_page.css";

const Interview = () => {
  const { sessionId } = useParams();
  const [violations, setViolations] = useState(0);
  const [popup, setPopup] = useState("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [statusLabel, setStatusLabel] = useState("Ready");
  const [emotionLabel, setEmotionLabel] = useState("Connecting...");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activityLog, setActivityLog] = useState([
    { text: "Session initialised", type: "accent", time: "0:00" },
    { text: "Face detection active", type: "accent", time: "0:01" },
    { text: "Proctoring enabled",   type: "neutral", time: "0:02" },
  ]);

  const tabWarningShown = useRef(false);
  const ws = useRef(null);
  const recognition = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Timer
  useEffect(() => {
    if (isInterviewStarted) {
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isInterviewStarted]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const addLog = (text, type = "neutral") => {
    setActivityLog((prev) => [
      { text, type, time: formatTime(elapsedTime) },
      ...prev.slice(0, 14),
    ]);
  };

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !tabWarningShown.current && isInterviewStarted) {
        triggerWarning("Tab switch detected");
        tabWarningShown.current = true;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isInterviewStarted]);

  const showPopup = (message) => {
    setPopup(message);
    setTimeout(() => setPopup(""), 3000);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { console.error("Speech recognition not supported"); return; }

    const recognitionInstance = new SpeechRecognition();
    recognition.current = recognitionInstance;
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = "en-US";

    let finalTranscript = "";
    let silenceTimer;

    recognitionInstance.start();
    setStatusLabel("Listening...");

    recognitionInstance.onresult = (event) => {
      clearTimeout(silenceTimer);
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + " ";
      }
      silenceTimer = setTimeout(() => recognitionInstance.stop(), 3000);
    };

    recognitionInstance.onend = () => {
      const finalText = finalTranscript.trim() || "no answer";
      setStatusLabel("Processing...");
      addLog("Answer submitted", "accent");
      if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(finalText);
      finalTranscript = "";
    };

    recognitionInstance.onerror = (err) => {
      console.error("Speech error:", err);
      if (ws.current?.readyState === WebSocket.OPEN) ws.current.send("no answer");
    };
  };

  const handleStartInterview = async () => {
    setIsInterviewStarted(true);
    setStatusLabel("Connecting...");
    addLog("Interview started", "accent");

    if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
      ws.current = new WebSocket(
        `ws://127.0.0.1:8000/api/interview/interview?session_id=${sessionId}`
      );
      ws.current.binaryType = "arraybuffer";
    }

    ws.current.onopen = () => {
      setStatusLabel("Live");
      addLog("WebSocket connected", "accent");
    };

    ws.current.onmessage = async (event) => {
      setStatusLabel("Question playing...");
      addLog("New question received", "neutral");
      const audioBlob = new Blob([event.data], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => startListening();
    };
  };

  const endSession = () => {
    window.speechSynthesis.cancel();
    clearInterval(timerRef.current);
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.close();
    setTimeout(() => { window.location.href = "/applications"; }, 500);
  };

const triggerWarning = (message) => {
  setViolations((prev) => {
    const updated = prev + 1;

    showPopup(message);
    addLog(`⚠ Violation: ${message}`, "danger");

    // only count violations
    // do NOT terminate interview

    return updated;
  });
};

  return (
    <div className="body">
      {popup && (
        <div className="warning-popup">⚠ {popup}</div>
      )}

      {/* ── Header ── */}
      <div className="headers_interview_page">
        <div className="header-left">
          <div className="back-btn-wrap">
            <NavLink to="/interviewForm">
              <span>← Back</span>
            </NavLink>
          </div>

          <div className="divider-v" />

          <div className="header-brand">
            <div className="brand-mark">
              <div className="brand-mark-ring" />
              <div className="brand-mark-dot" />
            </div>
            <span className="brand-name">AI Interview Suite</span>
            <span className="brand-tag">v2</span>
          </div>
        </div>

        <div className="header-right">
          {isInterviewStarted && (
            <span className="timer-display">{formatTime(elapsedTime)}</span>
          )}
          {isInterviewStarted && (
            <div className="live-pill" style={{ display:'flex', alignItems:'center', gap:'5px', padding:'4px 10px', borderRadius:'20px', background:'rgba(255,61,90,0.10)', border:'1px solid rgba(255,61,90,0.22)' }}>
              <div className="live-dot" style={{ width:'5px', height:'5px', borderRadius:'50%', background:'var(--danger)', animation:'blink 0.9s infinite' }} />
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'9px', fontWeight:600, color:'var(--danger)', letterSpacing:'0.1em' }}>REC</span>
            </div>
          )}
          <div className="header-status">
            <div className={`status-indicator ${isInterviewStarted ? "active" : ""}`} />
            <span className={`status-label ${isInterviewStarted ? "active" : ""}`}>
              {isInterviewStarted ? statusLabel : "Standby"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Instructions ── */}
      {/* <div className="interviewInstruction">
        <p>
          <span className="instruction-num">1</span>
          Press Start Interview, then answer each question aloud when prompted
        </p>
        <p>
          <span className="instruction-num">2</span>
          Stay in frame · Do not switch tabs · Keep your face clearly visible
        </p>
        <p>
          <span className="instruction-num">3</span>
          Response latency depends on your connection speed
        </p>
      </div> */}

      {/* ── Main ── */}
      <div className="main-content">

        {/* Video */}
        <div className="video-section">
          <div className="video-header">
            <div className="video-title-group">
              <span className="video-title">Live Camera Feed</span>
              {isInterviewStarted && (
                <div style={{ display:'flex', alignItems:'center', gap:'5px', padding:'3px 9px', borderRadius:'20px', background:'rgba(255,61,90,0.10)', border:'1px solid rgba(255,61,90,0.2)' }}>
                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'var(--danger)', animation:'blink 0.9s infinite' }} />
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:'9px', fontWeight:600, color:'var(--danger)', letterSpacing:'0.1em' }}>LIVE</span>
                </div>
              )}
            </div>
            {violations > 0 && (
              <div className="violation-badge">
                ⚠ {violations}  VIOLATION{violations > 1 ? "S" : ""}
              </div>
            )}
          </div>

          <div className="video-wrapper">
            {/* Corner brackets */}
            <div className="corner corner-tl" />
            <div className="corner corner-tr" />
            <div className="corner corner-bl" />
            <div className="corner corner-br" />

            <Video
              triggerWarning={triggerWarning}
              isActive={isInterviewStarted}
              autoPlay
              playsInline
            />
            <div className="face-guide" />

            <div className="video-overlay-top">
              <div className="emotion-badge">
                <span className="emotion-label">Emotion</span>
                <span className="emotion-value">{emotionLabel}</span>
              </div>
            </div>
            
            <div className="video-controls">
  {!isInterviewStarted ? (
    <button className="btn btn-start floating-btn" onClick={handleStartInterview}>
      <span className="btn-icon">▶</span>
      Start Interview
    </button>
  ) : (
    <NavLink to="/applications" style={{ textDecoration: "none" }}>
      <button className="btn btn-end floating-btn" onClick={endSession}>
        <span className="btn-icon">◼</span>
        End Interview
      </button>
    </NavLink>
  )}
</div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="sidebar">

          {/* Proctoring status */}
          <div className="info-card">
            <div className="card-label">Proctoring Status</div>
            <div className="proctoring-grid">
              {[
                { icon: "👁", name: "Face Track", ok: isInterviewStarted },
                { icon: "🎤", name: "Microphone", ok: isInterviewStarted },
                { icon: "🔒", name: "Tab Focus",  ok: true },
                { icon: "🧠", name: "AI Analysis", ok: isInterviewStarted },
              ].map((item) => (
                <div className="proctor-item" key={item.name}>
                  <span className="proctor-icon">{item.icon}</span>
                  <span className="proctor-name">{item.name}</span>
                  <div className={`proctor-status ${item.ok ? "ok" : ""}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Session info */}
          <div className="info-card">
            <div className="card-label">Session</div>
            {[
              { label: "ID",         value: sessionId ? `#${sessionId.slice(0, 8)}…` : "—",     danger: false },
              { label: "Duration",   value: formatTime(elapsedTime),                              danger: false },
              { label: "Violations", value: `${violations} `,                                  danger: violations > 0 },
              { label: "Status",     value: isInterviewStarted ? statusLabel : "Not started",    danger: false },
            ].map((row) => (
              <div className="session-row" key={row.label}>
                <span className="session-row-label">{row.label}</span>
                <span className={`session-row-value ${row.danger ? "danger" : ""}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Activity log */}
          <div className="info-card timeline">
            <div className="card-label">Activity Log</div>
            {activityLog.map((item, i) => (
              <div className="timeline-item" key={i}>
                <div className={`timeline-dot ${item.type}`} />
                <span className="timeline-text">{item.text}</span>
                <span className="timeline-time">{item.time}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Footer ── */}

    </div>
  );
};

export default Interview;