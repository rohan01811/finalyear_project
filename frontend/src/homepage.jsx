import React, { useEffect, useRef, useState } from "react";
import GLOBE from "vanta/dist/vanta.globe.min";
import * as THREE from "three";
import "./homepage.css";
import { NavLink, useNavigate } from "react-router-dom";

function Home() {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        GLOBE({
          el: vantaRef.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 600,
          minWidth: 600,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0x00c2ff,
color2: 0x005577,
          points: 14.0,
          maxDistance: 22.0,
          spacing: 18.0,
          backgroundColor: 0x0a0f1a,
        })
      );
    }
    return () => { if (vantaEffect) vantaEffect.destroy(); };
  }, [vantaEffect]);

  const userProfile = JSON.parse(localStorage.getItem("userProfile"));
  const userName = userProfile?.name;

  const handleLogout = () => {
    localStorage.removeItem("session");
    localStorage.removeItem("userProfile");
    navigate("/");
  };

  return (
    <div ref={vantaRef} className="home">

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="brand">
          <span className="brand-dot" />
          <span className="brand-name">HireAI</span>
        </div>

        <div className="nav-right">
          {userName ? (
            <>
              <div className="user-chip">
                <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
                <span className="user-name">{userName}</span>
              </div>
              <button className="nav-btn ghost" onClick={() => navigate("/notifications")}>
                Notifications
              </button>
              <button className="nav-btn outline-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">
                <button className="nav-btn ghost">Login</button>
              </NavLink>
              <NavLink to="/signup">
                <button className="nav-btn primary-cta">Get Started</button>
              </NavLink>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="hero">
        <div className="hero-badge">
          <span className="badge-dot" />
          AI-Powered Career Platform
        </div>

        <h1 className="hero-title">
          Land Your Dream Job <br />
          With HireAI

        </h1>

        <p className="hero-sub">
          Intelligent resume analysis, real-time job matching,<br />
          and smart application tracking — all in one place.
        </p>

        <div className="hero-actions">
          <NavLink to="/atsChecking">
            <button className="action-btn solid">Resume Analysis</button>
          </NavLink>
          <NavLink to="/jobs">
            <button className="action-btn solid">Jobs Search</button>
          </NavLink>
          <NavLink to="/applications">
            <button className="action-btn solid">Application History</button>
          </NavLink>
        </div>

        <div className="stats-row">
          <div className="stat">
            <span className="stat-num">98%</span>
            <span className="stat-desc">ATS Pass Rate</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">50K+</span>
            <span className="stat-desc">Jobs Indexed</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-num">3x</span>
            <span className="stat-desc">Faster Hiring</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;