import React, { useEffect, useState } from "react";
import axios from "axios";

/* ── Global font + keyframes injected once ── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; background: #0d0f14; font-family: 'Inter', sans-serif; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .app-card {
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }
    .app-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.55) !important;
    }
    .fade-up {
      animation: fadeUp 0.35s ease both;
    }
    .primary-btn {
      transition: opacity 0.15s, transform 0.15s;
    }
    .primary-btn:hover:not(:disabled) { opacity: 0.88; transform: scale(0.99); }
    .primary-btn:disabled { opacity: 0.45; cursor: not-allowed; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #1e2330; border-radius: 2px; }
  `}</style>
);

/* ── Status config ── */
const statusConfig = {
  applied:        { label: "Applied",        color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.28)" },
  interview_done: { label: "Interview Done", color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.28)" },
  rejected:       { label: "Rejected",       color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.28)" },
  shortlisted:    { label: "Shortlisted",    color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.28)" },
};
const getStatus = (s) => statusConfig[s] || { label: s, color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)" };

/* ── Single Application Card ── */
const AppCard = ({ app, loadingId, onStartInterview, onViewReport, index }) => {
  const job    = app.jobs || {};
  const status = getStatus(app.status);
  const isLoading = loadingId === app.id;

  return (
    <div
      className="app-card fade-up"
      style={{
        animationDelay: `${index * 0.06}s`,
        background: "#111318",
        border: "1px solid rgba(255,255,255,0.07)",
        borderTop: `2px solid ${status.color}`,
        borderRadius: 12,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "0 4px 16px rgba(0,0,0,0.35)"
      }}
    >
      {/* ── Top: company + status badge ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3 }}>
            {job.company || "—"}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#4b5563", marginTop: 4, fontWeight: 400 }}>
            {job.title || "—"}
          </div>
        </div>
        <span style={{
          flexShrink: 0,
          fontSize: "0.68rem", fontWeight: 600,
          textTransform: "uppercase", letterSpacing: "0.08em",
          color: status.color,
          background: status.bg,
          border: `1px solid ${status.border}`,
          borderRadius: 999,
          padding: "3px 10px",
          whiteSpace: "nowrap"
        }}>
          {status.label}
        </span>
      </div>

      {/* ── Meta row: location / type if available ── */}
      <div style={{
        display: "flex", gap: 16,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        paddingTop: 12
      }}>
        {job.location && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 12 }}>📍</span>
            <span style={{ fontSize: "0.76rem", color: "#cbd5e1" }}>{job.location}</span>
          </div>
        )}
        {job.type && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 12 }}>💼</span>
            <span style={{ fontSize: "0.76rem", color: "#cbd5e1" }}>{job.type}</span>
          </div>
        )}
        {!job.location && !job.type && (
          <span style={{ fontSize: "0.76rem", color: "#94a3b8" }}>No additional details</span>
        )}
      </div>

      {/* ── Action button ── */}
      <div>
        {app.status === "applied" && (
          <button
            className="primary-btn"
            onClick={() => onStartInterview(job.id, app.id)}
            disabled={isLoading}
            style={{
  width: "100%",
  padding: "10px 0",
  borderRadius: 8,
  background: isLoading ? "#1a2a1a" : "rgba(52,211,153,0.15)",
  color: isLoading ? "#374151" : "#34d399",
  border: `1px solid ${isLoading ? "rgba(255,255,255,0.05)" : "rgba(52,211,153,0.3)"}`,
  fontSize: "0.85rem",
  fontWeight: 600,
  fontFamily: "'Inter', sans-serif",
  cursor: isLoading ? "not-allowed" : "pointer",
}}
          >
            {isLoading ? (
              <>
                <span style={{ fontSize: 13, opacity: 0.6 }}>⏳</span>
                Starting Interview...
              </>
            ) : (
              <>
                <span style={{ fontSize: 13 }}>🚀</span>
                Start Interview
              </>
            )}
          </button>
        )}

        {app.status === "interview_done" && (
          <button
            className="primary-btn"
            onClick={() => onViewReport(app.id)}
            style={{
              width: "100%", padding: "10px 0",
              borderRadius: 8, border: "1px solid rgba(96,165,250,0.3)",
              background: "rgba(96,165,250,0.1)",
              color: "#60a5fa",
              fontSize: "0.85rem", fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7
            }}
          >
            <span style={{ fontSize: 13 }}></span>
            Interview Completed !
          </button>
        )}

        {app.status === "rejected" && (
          <div style={{
            width: "100%", padding: "10px 0", textAlign: "center",
            borderRadius: 8, background: "rgba(248,113,113,0.06)",
            border: "1px solid rgba(248,113,113,0.15)",
            fontSize: "0.82rem", color: "#6b7280"
          }}>
            Application closed
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Skeleton loader ── */
const SkeletonCard = ({ index }) => (
  <div className="fade-up" style={{
    animationDelay: `${index * 0.05}s`,
    background: "#111318", border: "1px solid rgba(255,255,255,0.06)",
    borderTop: "2px solid #1e2330",
    borderRadius: 12, padding: "20px 22px",
    display: "flex", flexDirection: "column", gap: 14
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ width: 130, height: 14, background: "#1a1f2e", borderRadius: 4, marginBottom: 8 }} />
        <div style={{ width: 90, height: 10, background: "#161b28", borderRadius: 4 }} />
      </div>
      <div style={{ width: 68, height: 20, background: "#1a1f2e", borderRadius: 999 }} />
    </div>
    <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />
    <div style={{ width: "100%", height: 36, background: "#161b28", borderRadius: 8 }} />
  </div>
);

/* ── Stats bar ── */
const StatsBar = ({ applications }) => {
  const total    = applications.length;
  const applied  = applications.filter(a => a.status === "applied").length;
  const done     = applications.filter(a => a.status === "interview_done").length;
  const rejected = applications.filter(a => a.status === "rejected").length;

  const stats = [
    { label: "Total",          value: total,    color: "#e2e8f0" },
    { label: "Pending",        value: applied,  color: "#fbbf24" },
    { label: "Interview Done", value: done,     color: "#34d399" },
    { label: "Rejected",       value: rejected, color: "#f87171" },
  ];

  return (
    <div style={{
      display: "flex", gap: 1,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 10, overflow: "hidden",
      marginBottom: 28
    }}>
      {stats.map(({ label, value, color }) => (
        <div key={label} style={{
          flex: 1, textAlign: "center", padding: "12px 8px",
          borderRight: "1px solid rgba(255,255,255,0.05)"
        }}>
          <div style={{
            fontSize: "1.3rem", fontWeight: 700, color,
            fontFamily: "'JetBrains Mono', monospace"
          }}>{value}</div>
          <div style={{ fontSize: "0.68rem", color: "#cbd5e1", textTransform: "uppercase",
            letterSpacing: "0.1em", marginTop: 2 }}>{label}</div>
        </div>
      ))}
    </div>
  );
};

/* ── Main Component ── */
function Applications() {
  const [applications, setApplications] = useState([]);
  const [loadingId, setLoadingId]       = useState(null);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("all");

  useEffect(() => { fetchApplications(); }, []);

  const getValidToken = async () => {
    const session = JSON.parse(localStorage.getItem("session"));
    if (!session) return null;
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at <= now + 60) {
      try {
        const res = await fetch("http://127.0.0.1:8000/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: session.refresh_token })
        });
        const data = await res.json();
        if (res.ok) { localStorage.setItem("session", JSON.stringify(data.session)); return data.session.access_token; }
        else { localStorage.clear(); window.location.href = "/login"; return null; }
      } catch (err) { console.error("Refresh failed", err); return null; }
    }
    return session.access_token;
  };

  const fetchApplications = async () => {
    try {
      const token = await getValidToken();
      if (!token) { alert("Please login again ⚠️"); return; }
      const res = await axios.get("http://127.0.0.1:8000/jobs/my-applications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data.data || []);
    } catch (error) { console.error("Fetch error:", error); }
    finally { setLoading(false); }
  };

  const handleStartInterview = async (jobId, applicationId) => {
    try {
      setLoadingId(applicationId);
      const token = await getValidToken();
      await axios.get(`http://127.0.0.1:8000/jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
      const res = await axios.post("http://127.0.0.1:8000/api/interview/create",
        { application_id: applicationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.location.href = `/interview/${res.data.session_id}`;
    } catch (error) { console.error(error); alert("Failed to start interview"); setLoadingId(null); }
  };

  const handleViewReport = (appId) => {
    alert("View Report for application: " + appId);
  };

  const filters = ["all", "applied", "interview_done", "rejected"];
  const filtered = filter === "all" ? applications : applications.filter(a => a.status === filter);

  return (
    <>
      <GlobalStyles />

      {/* Full-viewport wrapper — background fills everything */}
      <div style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#0d0f14",
        color: "#e2e8f0",
        overflowX: "hidden"
      }}>

        {/* ── Sticky top bar ── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 100,
          width: "100%",
          background: "rgba(13,15,20,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 28px", height: 54,
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e2e8f0" }}>
            📂 Application History
          </span>
          <span style={{
            fontSize: "0.68rem", fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.1em", color: "#cbd5e1",
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            {applications.length} total
          </span>
        </div>

        {/* ── Page content — inner max-width centers content but bg stretches full ── */}
        <div style={{ width: "100%", padding: "32px 28px 60px" }}>

          {/* Inner wrapper — centers content nicely on large screens */}
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>

            {/* Page heading */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: "1.25rem", textTransform: "uppercase",
                letterSpacing: "0.14em", color: "#cbd5e1", marginBottom: 5 }}>
                Candidate Dashboard
              </div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e2e8f0" }}>
                My Applications
              </h1>
              <p style={{ fontSize: "0.82rem", color: "#cbd5e1", marginTop: 4 }}>
                Track your job applications and start or review interviews below.
              </p>
            </div>

            {/* Stats bar */}
            {!loading && applications.length > 0 && <StatsBar applications={applications} />}

            {/* Filter tabs */}
            {!loading && applications.length > 0 && (
              <div style={{
                display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap"
              }}>
                {filters.map(f => {
                  const active = filter === f;
                  const cfg = f === "all" ? { color: "#e2e8f0", bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.18)" }
                    : { color: getStatus(f).color, bg: getStatus(f).bg, border: getStatus(f).border };
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      style={{
                        padding: "5px 14px", borderRadius: 999, border: `1px solid ${active ? cfg.border : "rgba(255,255,255,0.08)"}`,
                        background: active ? cfg.bg : "transparent",
                        color: active ? cfg.color : "#cbd5e1",
                        fontSize: "0.75rem", fontWeight: 600,
                        textTransform: "capitalize", fontFamily: "'Inter', sans-serif",
                        cursor: "pointer", letterSpacing: "0.04em",
                        transition: "all 0.15s"
                      }}
                    >
                      {f === "all" ? "All" : f === "interview_done" ? "Interview Done" : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Cards grid ── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: 16,
              width: "100%"
            }}>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} index={i} />)
                : filtered.map((app, i) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    index={i}
                    loadingId={loadingId}
                    onStartInterview={handleStartInterview}
                    onViewReport={handleViewReport}
                  />
                ))
              }
            </div>

            {/* Empty state */}
            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "70px 20px" }}>
                <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>📭</div>
                <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#cbd5e1" }}>
                  {filter === "all" ? "No applications yet" : `No ${filter.replace("_", " ")} applications`}
                </p>
                <p style={{ fontSize: "0.8rem", marginTop: 4, color: "#94a3b8" }}>
                  {filter === "all" ? "Apply to jobs to see them here." : "Try a different filter."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Applications;