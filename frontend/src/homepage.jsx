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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile"); // ✅ important
    navigate("/");
};
    return (
        <div ref={vantaRef} className="home">
            <div className="navbar">
               {userName ? (
    <>
        <span className="welcom-home">Welcome, {userName}</span>
        <button className="nav-btn" onClick={handleLogout}>
            Logout
        </button>
    </>
) : (  
                    <>
<div className="loginInputs">
  <label>Login As :</label>
  <select value={role} onChange={(e) => setRole(e.target.value)}>
    <option value="candidate">Candidate</option>
    <option value="hr">HR</option>
  </select>
</div>
                        {/* create dropbox which has options like login as candidate and login as HR */}
                        <NavLink to="/signup">
                            <button className="nav-btn">Signup</button>
                        </NavLink>
                    </>
                )}


            </div>

            <div className="heading">
                <h1>Hire AI</h1>
            </div>
            <h3> AI-Powered solutions for Career Success!🚀 </h3>

            <div className="buttons_home">
                <NavLink to="/interviewForm"><button>Interview Practice</button></NavLink>
                <NavLink to="/atsChecking"><button>Resume Analysis</button></NavLink>
                <NavLink to="/jobs"><button>Jobs Search</button></NavLink>
            </div>
        </div>
    )
}

export default Home;