import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "./login.css";
import Backtbtn from "./back";

function Login() {
  const [userEmail, setEmail] = useState("");
  const [userPassword, setPassword] = useState("");
  const [role, setRole] = useState("candidate");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function refreshSession() {
    const session = JSON.parse(localStorage.getItem("session"));
    const res = await fetch("http://127.0.0.1:8000/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("session", JSON.stringify(data.session));
      return data.session.access_token;
    } else {
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  const handleLogin = async () => {
    if (!userEmail || !userPassword) return;
    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, password: userPassword, role }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("session", JSON.stringify(data.session));
        const userRes = await fetch(`http://127.0.0.1:8000/auth/me/${data.user.id}`);
        const userData = await userRes.json();
        localStorage.setItem("userProfile", JSON.stringify({ ...userData, role }));
        navigate("/");
      } else {
        alert(data.detail || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-root">
      {/* Background geometric accent */}
      <div className="login-bg-accent" />

      {/* Back button */}
      <NavLink className="back-btn" to="/">
        <Backtbtn />
      </NavLink>

      <div className="login-container">
        {/* Left panel — branding */}
        {/* <div className="login-brand-panel">
          <div className="brand-logo">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="#22c55e" />
              <path d="M10 18 L16 24 L26 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="brand-name">TalentAI</span>
          </div>

          <div className="brand-copy">
            <h1 className="brand-headline">Your next opportunity starts here.</h1>
            <p className="brand-sub">AI-powered interviews. Smarter hiring. Real results.</p>
          </div>

          <div className="brand-stats">
            <div className="stat">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Candidates placed</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">98%</span>
              <span className="stat-label">Satisfaction rate</span>
            </div>
          </div>
        </div> */}

        {/* Right panel — form */}
        <div className="login-form-panel">
          <div className="form-header">
            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">Sign in to continue your journey</p>
          </div>

          {/* Role toggle */}
          {/* <div className="role-toggle">
            <button
              className={`role-btn ${role === "candidate" ? "active" : ""}`}
              onClick={() => setRole("candidate")}
              type="button"
            >
              Candidate
            </button>
            <button
              className={`role-btn ${role === "recruiter" ? "active" : ""}`}
              onClick={() => setRole("recruiter")}
              type="button"
            >
              Recruiter
            </button>
          </div> */}

          {/* Email */}
          <div className="field-group">
            <label className="field-label" htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="email"
                type="email"
                className="field-input"
                value={userEmail}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="field-group">
            <label className="field-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="field-input"
                value={userPassword}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="forgot-row">
            <NavLink to="/forgot-password" className="forgot-link">Forgot password?</NavLink>
          </div>

          {/* Login button */}
          <button
            className={`login-btn ${isLoading ? "loading" : ""}`}
            onClick={handleLogin}
            disabled={isLoading || !userEmail || !userPassword}
            type="button"
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>

          <p className="signup-prompt">
            Don't have an account?{" "}
            <NavLink to="/signup" className="signup-link">Create one free</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;