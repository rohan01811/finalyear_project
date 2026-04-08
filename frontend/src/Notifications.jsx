import React, { useState,useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
// Placeholder Back button (same as your Jobs page)
const Backtbtn = () => (
  <button style={{ padding: "10px 20px", cursor: "pointer" }}>
    ← Back
  </button>
);

function Notifications() {

const [selectedReport, setSelectedReport] = useState(null);
const [showModal, setShowModal] = useState(false);
 const [notifications, setNotifications] = useState([]);

  useEffect(() => {
  const fetchNotifications = async () => {
const res = await axios.get("http://127.0.0.1:8000/notifications/");
    setNotifications(res.data);
  };

  fetchNotifications();
}, []);

const handleNotificationClick = async (n) => {
  if (!n.interview_id) {
    console.warn("No interview_id found");
    return;
  }

  try {
    const res = await axios.get(
      `http://127.0.0.1:8000/reports/${n.interview_id}`
    );

    setSelectedReport(res.data);
    setShowModal(true);
  } catch (err) {
    console.error(err);
  }
};

  const markAsRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getColor = (type) => {
    switch (type) {
      case "success":
        return "#4CAF50";
      case "warning":
        return "#FF9800";
      case "info":
        return "#2196F3";
      default:
        return "#888";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        padding: "20px",
        backgroundColor: "#1a1a1a",
        color: "white",
      }}
    >
      {/* Back Button */}
      <div style={{ position: "absolute", left: "30px", top: "30px" }}>
        <NavLink to="/">
          <Backtbtn />
        </NavLink>
      </div>

      {/* Title */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "60px",
          flexDirection: "column",
        }}
      >
        <h1 style={{ fontSize: "2.5rem" }}>🔔 Notifications</h1>
        <p style={{ color: "#aaa", marginTop: "5px" }}>
          Stay updated with your activity
        </p>
      </div>

      {/* Clear All */}
      {notifications.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={clearAll}
            style={{
              padding: "10px 20px",
              backgroundColor: "#e53935",
              border: "none",
              borderRadius: "8px",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div
        style={{
          display: "grid",
          gap: "20px",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {notifications.map((n) => (
         <div
  key={n.id}
onClick={() => n.interview_id && handleNotificationClick(n)}
  style={{
    cursor: "pointer", // 👈 important
    background: n.read ? "#2a2a2a" : "linear-gradient(135deg, #2c2c2c, #1f1f1f)",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    borderLeft: `5px solid ${getColor(n.type)}`,
    boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
    transition: "0.3s",
  }}
>
            {/* Title */}
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              {n.title}
            </div>

            {/* Message */}
            <p style={{ color: "#ccc", fontSize: "0.95rem" }}>
              {n.message}
            </p>

            {/* Footer */}
            <div
              style={{
                marginTop: "auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                
              }}
            >
              <span style={{ fontSize: "0.8rem", color: "#888" }}>
                {new Date(n.created_at).toLocaleString()}
              </span>

              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    backgroundColor: "#2196F3",
                    border: "none",
                    borderRadius: "6px",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            color: "#777",
            fontSize: "1.2rem",
          }}
        >
          🎉 You're all caught up! No notifications.
        </div>
      )}

      {showModal && selectedReport && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        color: "black",
        padding: "30px",
        borderRadius: "12px",
        width: "500px",
        maxWidth: "90%",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>📊 Interview Report</h2>

      <p><b>Technical Score:</b> {selectedReport.technical_score}</p>
      <p><b>Communication:</b> {selectedReport.communication_score}</p>
      <p><b>Overall:</b> {selectedReport.overall_score}</p>

      <hr />

      <p><b>Strengths:</b> {selectedReport.strengths}</p>
      <p><b>Improvements:</b> {selectedReport.improvements}</p>
      <p><b>Recommendation:</b> {selectedReport.recommendation}</p>

      <div style={{ textAlign: "right", marginTop: "20px" }}>
        <button
          onClick={() => setShowModal(false)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#e53935",
            border: "none",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Notifications;