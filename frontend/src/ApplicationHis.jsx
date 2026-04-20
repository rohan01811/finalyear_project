import React, { useEffect, useState } from "react";
import axios from "axios";
const styles = {
container: {
  padding: "30px",
  background: "#0f172a",
  minHeight: "100vh",
  color: "#fff",
  width: "100%",              // ✅ ADD THIS
  maxWidth: "1400px",         // ✅ LIMIT FOR PROFESSIONAL LOOK
  margin: "0 auto",           // ✅ CENTER IT
},

  heading: {
    fontSize: "28px",
    marginBottom: "25px",
    fontWeight: "600"
  },

 grid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", // ✅ FIXED
  gap: "24px",
  width: "100%"
},

 card: {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
  transition: "0.3s",
  width: "100%",   // ✅ IMPORTANT
},

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  },

  company: {
    fontSize: "18px",
    fontWeight: "600"
  },

  role: {
    fontSize: "15px",
    color: "#cbd5f5",
    marginBottom: "15px"
  },

  status: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "capitalize",
    color: "#000"
  },

  actions: {
    marginTop: "10px"
  },

  primaryBtn: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#22c55e",
    color: "#000",
    fontWeight: "600",
    cursor: "pointer"
  },

  secondaryBtn: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#3b82f6",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer"
  }
};


function ApplicationHis() {
  const [applications, setApplications] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  // ✅ UNIVERSAL TOKEN FUNCTION
  const getValidToken = async () => {
    const session = JSON.parse(localStorage.getItem("session"));

    if (!session) return null;

    const now = Math.floor(Date.now() / 1000);

    // 🔄 refresh if expired
    if (session.expires_at <= now + 60) {
      try {
        const res = await fetch("http://127.0.0.1:8000/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
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

  // ✅ FETCH APPLICATIONS
  const fetchApplications = async () => {
    try {
      const token = await getValidToken();

      if (!token) {
        alert("Please login again ⚠️");
        return;
      }

      const res = await axios.get(
        "http://127.0.0.1:8000/jobs/my-applications",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setApplications(res.data.data || []);
    } catch (error) {
      console.error("Fetch Applications Error:", error);
    }
  };

  // ✅ START INTERVIEW
  const handleStartInterview = async (jobId, applicationId) => {
    try {
      setLoadingId(applicationId);

      const token = await getValidToken();

      const jobRes = await axios.get(
        `http://127.0.0.1:8000/jobs/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const res = await axios.post(
        "http://127.0.0.1:8000/api/interview/create",
        {
          application_id: applicationId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const sessionId = res.data.session_id;

      window.location.href = `/interview/${sessionId}`;
    } catch (error) {
      console.error(error);
      alert("Failed to start interview");
      setLoadingId(null);
    }
  };

  const handleViewReport = (appId) => {
    alert("View Report for application: " + appId);
  };

 return (
  <div style={styles.container}>
    <h1 style={styles.heading}>📂 Application History</h1>

    <div style={styles.grid}>
      {applications.map((app) => {
        const job = app.jobs;

        return (
          <div key={app.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.company}>{job?.company}</h2>
              <span
                style={{
                  ...styles.status,
                  backgroundColor:
                    app.status === "applied"
                      ? "#facc15"
                      : app.status === "interview_done"
                      ? "#22c55e"
                      : "#64748b"
                }}
              >
                {app.status}
              </span>
            </div>

            <p style={styles.role}>{job?.title}</p>

            <div style={styles.actions}>
              {app.status === "applied" && (
                <button
                  style={styles.primaryBtn}
                  onClick={() => handleStartInterview(job.id, app.id)}
                  disabled={loadingId === app.id}
                >
                  {loadingId === app.id
                    ? "⏳ Starting..."
                    : "🚀 Start Interview"}
                </button>
              )}

              {app.status === "interview_done" && (
                <button
                  style={styles.secondaryBtn}
                  onClick={() => handleViewReport(app.id)}
                >
                  📊 View Report
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
}

export default ApplicationHis;