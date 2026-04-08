// frontend/src/ApplicationHis.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

function ApplicationHis() {
  const [applications, setApplications] = useState([]);
const [loadingId, setLoadingId] = useState(null);
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");

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

      setApplications(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

const handleStartInterview = async (jobId, applicationId) => {
  try {
    setLoadingId(applicationId); // 🔥 show loading

    const jobRes = await axios.get(`http://127.0.0.1:8000/jobs/${jobId}`);
    const job = jobRes.data;

    const res = await axios.post("http://127.0.0.1:8000/api/interview/create", {
      application_id: applicationId
    });

    const sessionId = res.data.session_id;

    window.location.href = `/interview/${sessionId}`;

  } catch (error) {
    console.error(error);
    alert("Failed to start interview");
    setLoadingId(null); // reset on error
  }
};

  const handleViewReport = (appId) => {
    alert("View Report for application: " + appId);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1a1a1a, #0f0f0f)",
        color: "white",
        padding: "40px 20px"
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.8rem", marginBottom: "10px" }}>
          📂 Application History
        </h1>
        <p style={{ color: "#aaa" }}>Track your journey 🚀</p>
      </div>

      {/* GRID */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gap: "25px",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
        }}
      >
        {applications.map((app) => {
          const job = app.jobs;

          return (
         <div
  key={app.id}
  style={{
    background: "linear-gradient(145deg, #1e1e1e, #262626)",
    borderRadius: "22px",
    padding: "0",
    overflow: "hidden",
    border: "1px solid #2f2f2f",
    boxShadow: "0 15px 35px rgba(0,0,0,0.6)",
    transition: "0.3s",
    display: "flex",
    flexDirection: "column"
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px)";
    e.currentTarget.style.boxShadow =
      "0 20px 40px rgba(0,0,0,0.8)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow =
      "0 15px 35px rgba(0,0,0,0.6)";
  }}
>
  {/* 🔥 HEADER */}
  <div
    style={{
      background: "linear-gradient(90deg, #0f2027, #203a43, #2c5364)",
      padding: "18px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}
  >
    <div>
      <h2
        style={{
          margin: 0,
          fontSize: "1.4rem",
          fontWeight: "700",
          letterSpacing: "0.5px"
        }}
      >
        {job?.company}
      </h2>
    </div>

    <span
      style={{
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "bold",
        background:
          app.status === "selected"
            ? "#2e7d32"
            : app.status === "rejected"
            ? "#c62828"
            : app.status === "interview_done"
            ? "#ef6c00"
            : "#f9a825",
        color: "white"
      }}
    >
      {app.status}
    </span>
  </div>

  {/* 🎯 BODY */}
  <div style={{ padding: "20px" }}>
    {/* ROLE */}
    <p
      style={{
        fontSize: "1.15rem",
        fontWeight: "600",
        color: "#4FC3F7",
        marginBottom: "10px"
      }}
    >
      {job?.title}
    </p>

    {/* TYPE */}
    <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
      {job?.job_type}
    </p>

    {/* BUTTON */}
    <div style={{ marginTop: "25px" }}>
    {app.status === "applied" && (
  <button
    onClick={() => handleStartInterview(job.id, app.id)}
    disabled={loadingId === app.id}
    style={{
      width: "100%",
      padding: "12px",
      borderRadius: "12px",
      border: "none",
      background:
        loadingId === app.id
          ? "#555"
          : "linear-gradient(90deg, #2196F3, #00BCD4)",
      color: "white",
      fontWeight: "bold",
      cursor: loadingId === app.id ? "not-allowed" : "pointer"
    }}
  >
    {loadingId === app.id ? "Please wait..." : "Start Interview 🎤"}
  </button>
)}

 {app.status === "interview_done" && (
  <button
    onClick={() => handleViewReport(app.id)}
    style={{
      width: "100%",
      padding: "12px",
      borderRadius: "12px",
      border: "none",
      background:
        "linear-gradient(90deg, #9C27B0, #E040FB)",
      color: "white",
      fontWeight: "bold",
      cursor: "pointer"
    }}
  >
    Interview Done ✅ (View Report)
  </button>
)}

      {app.status === "selected" && (
        <button
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            background: "#2e7d32",
            color: "white",
            fontWeight: "bold"
          }}
        >
          Selected ✅
        </button>
      )}

      {app.status === "rejected" && (
        <button
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            background: "#c62828",
            color: "white",
            fontWeight: "bold"
          }}
        >
          Rejected ❌
        </button>
      )}
    </div>
  </div>
</div>
          );
        })}
      </div>
    </div>
  );
}

export default ApplicationHis;