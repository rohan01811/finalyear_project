import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "./signup.css";

function Signup() {
  const [userName, setName] = useState("");
  const [userEmail, setEmail] = useState("");
  const [userPassword, setPassword] = useState("");
  const [userRole, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!userName || !userEmail || !userRole || !userPassword) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          password: userPassword,
          role: userRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {

    // Store session
    localStorage.setItem(
        "session",
        JSON.stringify(data.session)
    );

    // Fetch profile
    const userRes = await fetch(
        `http://127.0.0.1:8000/auth/me/${data.user.id}`
    );

    const userData = await userRes.json();

    localStorage.setItem(
        "userProfile",
        JSON.stringify({
            ...userData,
            role: userData.role
        })
    );

    navigate("/");
}
else {
        alert(data.detail || "Signup failed");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="su-page">
      <div className="su-bg-grid" aria-hidden="true" />

      <NavLink to="/" className="su-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Back
      </NavLink>

      <div className="su-card">
        <div className="su-card-header">
          <div className="su-logo-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" />
              <line x1="12" y1="12" x2="12" y2="16" />
              <circle cx="12" cy="10" r="1" fill="currentColor" />
            </svg>
          </div>
          <h1 className="su-title">Create Account</h1>
          <p className="su-subtitle">Join the platform and get started today</p>
        </div>

        <div className="su-fields">
          <div className="su-field-group">
            <label className="su-label" htmlFor="su-name">Full Name</label>
            <div className="su-input-wrap">
              <svg className="su-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <input
                id="su-name"
                className="su-input"
                type="text"
                placeholder="John Smith"
                value={userName}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="su-field-group">
            <label className="su-label" htmlFor="su-email">Email Address</label>
            <div className="su-input-wrap">
              <svg className="su-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
              </svg>
              <input
                id="su-email"
                className="su-input"
                type="email"
                placeholder="john@company.com"
                value={userEmail}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="su-field-group">
            <label className="su-label" htmlFor="su-role">Role</label>
            <div className="su-input-wrap su-select-wrap">
              <svg className="su-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z"/>
              </svg>
              <select
                id="su-role"
                className="su-input su-select"
                value={userRole}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="" disabled>Select your role</option>
                <option value="candidate">Candidate</option>
                <option value="HR">HR</option>
              </select>
              <svg className="su-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>

          <div className="su-field-group">
            <label className="su-label" htmlFor="su-password">Password</label>
            <div className="su-input-wrap">
              <svg className="su-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="su-password"
                className="su-input su-input--pw"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={userPassword}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="su-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          className={`su-submit${loading ? " su-submit--loading" : ""}`}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="su-spinner" aria-hidden="true" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </>
          )}
        </button>

        <p className="su-login-link">
          Already have an account?{" "}
          <NavLink to="/" className="su-link">Sign in</NavLink>
        </p>
      </div>
    </div>
  );
}

export default Signup;