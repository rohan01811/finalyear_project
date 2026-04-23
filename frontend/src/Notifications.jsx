import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

/* ── Global styles ── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; background: #0d0f14; font-family: 'Inter', sans-serif; }

    @keyframes fillBar {
      from { width: 0% }
      to   { width: var(--w) }
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.96); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes overlayIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .score-bar { animation: fillBar 0.7s cubic-bezier(.4,0,.2,1) forwards; }
    .modal-box { animation: modalIn 0.2s ease both; }
    .overlay   { animation: overlayIn 0.18s ease both; }

    .notif-card {
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      cursor: pointer;
    }
    .notif-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important;
    }

    .mark-read-btn {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.15);
      color: #8b95a1;
      border-radius: 6px;
      padding: 5px 12px;
      font-family: 'Inter', sans-serif;
      font-size: 0.76rem;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: border-color 0.15s, color 0.15s;
    }
    .mark-read-btn:hover { border-color: rgba(255,255,255,0.3); color: #d1d5db; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #2a2e38; border-radius: 2px; }
  `}</style>
);

/* ── Helpers ── */
const typeColor = (type) => {
  if (type === "success") return "#34d399";
  if (type === "warning") return "#fbbf24";
  if (type === "info")    return "#60a5fa";
  return "#6b7280";
};

const perfInfo = (score) => {
  if (score >= 80) return { label: "Excellent",  color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)" };
  if (score >= 60) return { label: "Good",        color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)" };
  return                  { label: "Needs Work",  color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" };
};

/* ── Score bar ── */
const ScoreRow = ({ label, value, color, delay }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
      <span style={{ fontSize: "0.76rem", color: "#6b7280", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: "0.76rem", color: "#e2e8f0", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
        {value != null ? value.toFixed(1) : "—"}<span style={{ color: "#374151", fontWeight: 400 }}>/100</span>
      </span>
    </div>
    <div style={{ height: 5, background: "#1e2330", borderRadius: 3, overflow: "hidden" }}>
      <div
        className="score-bar"
        style={{ "--w": `${value || 0}%`, height: "100%", borderRadius: 3, background: color, animationDelay: `${delay}s` }}
      />
    </div>
  </div>
);

/* ── Report Modal ── */
const ReportModal = ({ report, onClose }) => {
  const perf     = perfInfo(report.overall_score || 0);
  const initials = (report.candidate_name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      className="overlay"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20
      }}
    >
      <div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 820,
          background: "#131720",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          boxShadow: "0 24px 64px rgba(0,0,0,0.65)",
          display: "flex", flexDirection: "column",
          overflow: "hidden"
        }}
      >

        {/* ── Header ── */}
        <div style={{
          background: "#0d0f14",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "18px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16
        }}>

          {/* Candidate */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10, flexShrink: 0,
              background: "linear-gradient(135deg, #34d399, #60a5fa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.9rem", fontWeight: 700, color: "#0d0f14"
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#e2e8f0" }}>{report.candidate_name}</div>
              <div style={{ fontSize: "0.76rem", color: "#4b5563", marginTop: 2 }}>{report.candidate_email}</div>
            </div>
          </div>

          {/* Job info */}
          <div style={{
            flex: 1, textAlign: "center",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            padding: "0 20px"
          }}>
            <div style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#374151", marginBottom: 3 }}>
              Role &amp; Company
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "#e2e8f0" }}>
              {report.job_title || "—"}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#60a5fa", marginTop: 2 }}>
              @ {report.company_name || "—"}
            </div>
          </div>

          {/* Perf badge + close */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              padding: "6px 14px", borderRadius: 8,
              background: perf.bg, border: `1px solid ${perf.border}`,
              textAlign: "center"
            }}>
              <div style={{ fontSize: "0.63rem", color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.08em" }}>Performance</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: perf.color, marginTop: 1 }}>{perf.label}</div>
            </div>
            <button onClick={onClose} style={{
              width: 28, height: 28, borderRadius: 7,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#6b7280", cursor: "pointer", fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>✕</button>
          </div>
        </div>

        {/* ── Two-column body ── */}
        <div style={{ display: "flex" }}>

          {/* Left: scores */}
          <div style={{
            width: 230, flexShrink: 0,
            padding: "18px 20px",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            background: "#0f1219"
          }}>
            <div style={{ fontSize: "0.63rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#374151", marginBottom: 12 }}>
              Score Breakdown
            </div>
            <ScoreRow label="Technical"     value={report.technical_score}     color="#34d399" delay={0.05} />
            <ScoreRow label="Communication" value={report.communication_score} color="#60a5fa" delay={0.15} />
            <ScoreRow label="Overall"       value={report.overall_score}       color="#a78bfa" delay={0.25} />

            {report.total_questions > 0 && (
              <div style={{
                marginTop: 16, padding: "12px 13px",
                background: "#131720", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9
              }}>
                <div style={{ fontSize: "0.63rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#374151", marginBottom: 5 }}>
                  Questions Answered
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace" }}>
                    {report.answered_questions}
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "#4b5563" }}>/ {report.total_questions}</span>
                </div>
                <div style={{ height: 3, background: "#1e2330", borderRadius: 2, marginTop: 7 }}>
                  <div style={{
                    width: `${(report.answered_questions / report.total_questions) * 100}%`,
                    height: "100%", background: "#a78bfa", borderRadius: 2
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Right: feedback */}
          <div style={{ flex: 1, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: "0.63rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#374151", marginBottom: 2 }}>
              Detailed Feedback
            </div>
            {[
              { icon: "✅", label: "Strengths",        text: report.strengths,      color: "#34d399" },
              { icon: "⚡", label: "Areas to Improve", text: report.improvements,   color: "#fbbf24" },
              { icon: "🎯", label: "Recommendation",   text: report.recommendation, color: "#a78bfa" },
            ].map(({ icon, label, text, color }) => (
              <div key={label} style={{
                flex: 1, background: "#0f1219",
                border: `1px solid ${color}20`, borderRadius: 10, padding: "12px 14px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 5,
                    background: `${color}14`, border: `1px solid ${color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10
                  }}>{icon}</div>
                  <span style={{ fontSize: "0.67rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color }}>
                    {label}
                  </span>
                </div>
                <p style={{ fontSize: "0.82rem", color: "#8b95a1", lineHeight: 1.65 }}>{text || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "10px 22px",
          display: "flex", justifyContent: "flex-end",
          background: "#0d0f14"
        }}>
          <button onClick={onClose} style={{
            padding: "7px 20px", borderRadius: 7,
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)",
            color: "#f87171", fontSize: "0.8rem", fontWeight: 600,
            fontFamily: "'Inter', sans-serif", cursor: "pointer"
          }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Notification Card ── */
const NotifCard = ({ n, onClickCard, onMarkRead }) => {
  const color = typeColor(n.type);
  return (
    <div
      className="notif-card"
      onClick={() => onClickCard(n)}
      style={{
        background: n.read ? "#111318" : "#131a24",
        border: "1px solid rgba(255,255,255,0.07)",
        borderLeft: `3px solid ${color}`,
        borderRadius: 12,
        padding: "18px 18px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: n.read ? "none" : "0 2px 12px rgba(0,0,0,0.35)"
      }}
    >
      {/* Top row: icon + title + unread dot */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: `${color}14`, border: `1px solid ${color}28`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
        }}>
          {n.type === "success" ? "✅" : n.type === "warning" ? "⚠️" : "💬"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{
              fontSize: "0.88rem", fontWeight: n.read ? 500 : 600,
              color: n.read ? "#8b95a1" : "#e2e8f0"
            }}>
              {n.title}
            </span>
            {!n.read && (
              <div style={{
                width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                background: color, boxShadow: `0 0 5px ${color}90`
              }} />
            )}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#4b5563", marginTop: 3 }}>{n.message}</div>
        </div>
      </div>

      {/* Bottom row: time + actions */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)"
      }}>
        <span style={{ fontSize: "0.72rem", color: "#2a3040" }}>
          {new Date(n.created_at).toLocaleString()}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!n.read && (
            <button
              className="mark-read-btn"
              onClick={e => { e.stopPropagation(); onMarkRead(n.id); }}
            >
              Mark as read
            </button>
          )}
          {n.interview_id && (
            <span style={{ fontSize: "0.75rem", fontWeight: 500, color, whiteSpace: "nowrap" }}>
              View report →
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ── */
function Notifications() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal]           = useState(false);
  const [notifications, setNotifications]  = useState([]);
  const [loading, setLoading]              = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getValidToken();

if (!token) {
  alert("Please login again");
  return;
}

const res = await axios.get(
  "http://127.0.0.1:8000/notifications/",
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

setNotifications(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);


  const getValidToken = async () => {
  const session = JSON.parse(localStorage.getItem("session"));

  if (!session) return null;

  const now = Math.floor(Date.now() / 1000);

  // refresh if expired
  if (session.expires_at <= now + 60) {
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refresh_token: session.refresh_token
        })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("session", JSON.stringify(data.session));
        return data.session.access_token;
      } else {
        localStorage.clear();
        window.location.href = "/login";
        return null;
      }
    } catch (err) {
      console.error("Refresh failed", err);
      return null;
    }
  }

  return session.access_token;
};

const handleClick = async (n) => {
  if (!n.interview_id) return;

  markAsRead(n.id);

  try {
    const token = await getValidToken();

    if (!token) {
      alert("Please login again");
      return;
    }

    const res = await axios.get(
      `http://127.0.0.1:8000/reports/${n.interview_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setSelectedReport(res.data);
    setShowModal(true);
  } catch (err) {
    console.error(err);
  }
};

  const markAsRead = (id) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const clearAll = () => setNotifications([]);
  const unread   = notifications.filter(n => !n.read).length;

  return (
    <>
      <GlobalStyles />

      {/* Root: full viewport width, no max-width anywhere */}
      <div style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#0d0f14",
        color: "#e2e8f0",
        overflowX: "hidden"
      }}>

        {/* ── Navbar — spans full viewport ── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 100,
          width: "100vw",
          background: "rgba(13,15,20,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 28px", height: 54,
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <NavLink to="/" style={{ textDecoration: "none" }}>
            <button style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.12)",
              color: "#8b95a1", borderRadius: 7, padding: "6px 14px",
              fontSize: "0.8rem", fontWeight: 500, fontFamily: "'Inter', sans-serif",
              cursor: "pointer"
            }}>← Back</button>
          </NavLink>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e2e8f0" }}>🔔 Notifications</span>
            {unread > 0 && (
              <span style={{
                fontSize: "0.68rem", fontWeight: 700,
                background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.28)",
                color: "#34d399", borderRadius: 999, padding: "2px 9px"
              }}>{unread} new</span>
            )}
          </div>

          {notifications.length > 0
            ? <button onClick={clearAll} style={{
                background: "transparent", border: "1px solid rgba(248,113,113,0.25)",
                color: "#f87171", borderRadius: 7, padding: "6px 14px",
                fontSize: "0.78rem", fontWeight: 500, fontFamily: "'Inter', sans-serif",
                cursor: "pointer"
              }}>Clear all</button>
            : <div style={{ width: 82 }} />
          }
        </div>

        {/* ── Page title ── */}
        <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "#1f2937", marginBottom: 4 }}>
            Activity Center
          </div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#e2e8f0" }}>All Notifications</h1>
        </div>

        {/* ── Cards grid — full width with padding ── */}
        <div style={{
          width: "100%",
          padding: "24px 28px 48px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16
        }}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                height: 110, borderRadius: 12,
                background: "#111318",
                border: "1px solid rgba(255,255,255,0.05)"
              }} />
            ))
            : notifications.map(n => (
              <NotifCard
                key={n.id}
                n={n}
                onClickCard={handleClick}
                onMarkRead={markAsRead}
              />
            ))
          }
        </div>

        {/* ── Empty state ── */}
        {!loading && notifications.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 28px" }}>
            <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>🎉</div>
            <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#374151" }}>You're all caught up</p>
            <p style={{ fontSize: "0.8rem", marginTop: 4, color: "#1f2937" }}>No notifications at the moment.</p>
          </div>
        )}
      </div>

      {showModal && selectedReport && (
        <ReportModal report={selectedReport} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

export default Notifications;