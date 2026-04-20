import React from "react";
import GLOBE from "vanta/dist/vanta.globe.min";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import "./homepage.css"
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
function Home() {
    const [vantaEffect, setVantaEffect] = useState(0);
    const navigate = useNavigate();
    const [role, setRole] = useState("candidate"); // default to candidate

    const vantaRef = useRef(null);
    useEffect(() => {
        if (!vantaEffect) {
            setVantaEffect(
                GLOBE({
                    el: vantaRef.current,
                    THREE: THREE,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 600.0,
                    minWidth: 600.0,
                    scale: 1.0,
                    scaleMobile: 1.0,
                    color1: "0x00ff00",

                    points: 20.0,
                    backgroundColor: 0x111111

                })
            );
        }
        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaEffect]);

const userProfile = JSON.parse(localStorage.getItem("userProfile"));
const userName = userProfile?.name; 

const handleLogout = () => {
    localStorage.removeItem("session"); // ✅ critical for security

    localStorage.removeItem("userProfile"); // ✅ important
    navigate("/");
};
    return (
        <div ref={vantaRef} className="home">
<div className="navbar">
    {userName ? (
        <>
            <span className="welcom-home">Welcome, {userName}</span>

            <div className="nav-right">
                <button
                    className="nav-btn secondary"
                    onClick={() => navigate("/notifications")}
                >
                    Notifications
                </button>

                <button
                    className="nav-btn danger"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </>
    ) : (
        <div className="nav-right">
            <NavLink to="/login">
                <button className="nav-btn primary">Login</button>
            </NavLink>
            <NavLink to="/signup">
                <button className="nav-btn primary">Signup</button>
            </NavLink>
        </div>
    )}
</div>

            <div className="heading">
                <h1>Hire AI</h1>
            </div>
            <h3> AI-Powered solutions for Career Success!🚀 </h3>

            <div className="buttons_home">
                <NavLink to="/applications"><button>Application History</button></NavLink>
                <NavLink to="/atsChecking"><button>Resume Analysis</button></NavLink>
                <NavLink to="/jobs"><button>Jobs Search</button></NavLink>
            </div>
        </div>
    )
}

export default Home;