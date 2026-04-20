import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "./login.css";
import Backtbtn from "./back";

function Login() {
  const [userEmail, setEmail] = useState("");
  const [userPassword, setPassword] = useState("");
  const [role, setRole] = useState("candidate"); // default
  const navigate = useNavigate();

  async function refreshSession() {
  const session = JSON.parse(localStorage.getItem("session"));

  const res = await fetch("http://127.0.0.1:8000/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refresh_token: session.refresh_token
    }),
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
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          password: userPassword,
          role: role 
        }),
      });

      const data = await res.json();

if (res.ok) {

  // ✅ STORE SESSION (CRITICAL)
  localStorage.setItem("session", JSON.stringify(data.session));

  const userRes = await fetch(`http://127.0.0.1:8000/auth/me/${data.user.id}`);
  const userData = await userRes.json();
  const finalUser = { ...userData, role };

  localStorage.setItem("userProfile", JSON.stringify(finalUser));

  navigate("/");
}
 else {
        alert(data.detail || "Login failed");
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div>
      <NavLink className="back-btn" to="/">
        <Backtbtn />
      </NavLink>

      <div className="loginBody">
        <div className="login-heading">
          You need to login first to use AI features 🚀
        </div>

        <div className="login-main">
          <div className="loginInputs">
            <label>Email : </label>
            <input
              value={userEmail}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
          </div>

          <div className="loginInputs">
            <label>Password : </label>
            <input
              type="password"
              value={userPassword}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>

          <div className="login-btn">
            <button onClick={handleLogin}>Login</button>
          </div>

          <p>
            Don't have an account?{" "}
            <NavLink to="/signup">Sign up</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;