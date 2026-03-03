import React from "react";
import GLOBE from "vanta/dist/vanta.globe.min";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import "./homepage.css"
import { NavLink } from "react-router-dom";

function Home() {
    const [vantaEffect, setVantaEffect] = useState(0);
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
    const userName = localStorage.getItem("jobreadypro-username");

    return (
        <div ref={vantaRef} className="home">
            <div className="navbar">
                {userName ? (
                    <span className="welcom-home">Welcome, {userName} </span>
                ) : (
                    <>
                        <NavLink to="/login">
                            <button className="nav-btn">Login</button>
                        </NavLink>
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