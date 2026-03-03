import { useState, useRef, useEffect } from "react";
import pdfToText from "react-pdftotext";
import { NavLink } from "react-router-dom";
import RINGS from "vanta/dist/vanta.rings.min";
import * as THREE from "three";
import "./interview_form.css"
import Backtbtn from "./back";



function InterviewForm() {
    const [role, setRole] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("");
    const [resume, setResume] = useState("");
    const [experience, setExperience] = useState("");
    const [interviewType, setInterviewType] = useState("");
    const resumeRef = useRef(null);

    function extractText(event) {
        const file = event.target.files[0];
        if (!file) {
            console.error("No file selected");
            return;
        }

        pdfToText(file)
            .then((text) => {
                setResume(text);
            })
            .catch((error) => console.error("Failed to extract text from PDF", error));
    }

async function handleSubmit() {
  try {
    const response = await fetch("http://localhost:8000/api/interview/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        job_description: description,
        jobType: type,
        experience,
        interview_type: interviewType
      })
    });

    const data = await response.json();

    if (!response.ok) throw new Error("Failed to create session");

    // navigate with session id
    window.location.href = `/interview/${data.session_id}`;

  } catch (err) {
    console.error(err);
  }
}

    const [vantaEffect, setVantaEffect] = useState(0);
    const vantaRef = useRef(null);

    useEffect(() => {
        if (!vantaEffect) {
            setVantaEffect(
                RINGS({
                    el: vantaRef.current,
                    THREE: THREE,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 600.0,
                    minWidth: 600.0,
                    scale: 1.0,
                    scaleMobile: 1.0,
                    color1: "#0xff0000",
                    points: 20.0,
                    backgroundColor: 0x111111

                })
            );
        }
        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaEffect]);

    return (
        <div ref={vantaRef} id="body">
            <div className="headers">
                <NavLink to="/"><Backtbtn /></NavLink>
                <h1>AI POWERED INTERVIEW SYSTEM</h1>
            </div>


            <div className="inputs">
                <div className="inputs_left">
                    <div className="role centre">
                        <label>Select Role:</label>
                        <select onChange={(e) => setRole(e.target.value)}>
                            <option value="">Select Role</option>
                            <option value="AIML">AIML</option>
                            <option value="WebDevelopment">Web Development</option>
                            <option value="DataScience">Data Science</option>
                            <option value="CloudComputing">Cloud Computing</option>
                            <option value="CyberSecurity">Cyber Security</option>
                            <option value="Blockchain">Blockchain</option>
                            <option value="DevOps">DevOps</option>
                            <option value="UIUXDesign">UI/UX Design</option>
                        </select>

                    </div>

                    <div className="description centre">
                        <label>Enter Job Description:</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter job description"
                        />
                    </div>
                </div>
                <div className="inputs_right">

                    <div className="jobtype centre">
                        <label>Select Job Type:</label>
                        <select onChange={(e) => setType(e.target.value)}>
                            <option value="">Select Job Type</option>
                            <option value="intern">Intern</option>
                            <option value="full_time">Full Time</option>
                        </select>
                    </div>

                    <div className="experience centre">
                        <label>Years of experience:</label>
                        <input type="number" onChange={(e) => setExperience(e.target.value)} />
                    </div>
                    
                    <div className="interviwType centre">
                        <label>Type of interview:</label>
                        <select onChange={(e) => setInterviewType(e.target.value)}>
                            <option value="">Type of interview</option>
                            <option value="technical">Technical</option>
                            <option value="hr_level">HR Level</option>
                        </select>                    
                    </div>

                    {/* <div className="resume centre">
                        <label>Upload Resume (PDF):</label>
                        <input type="file" ref={resumeRef} accept="application/pdf" onChange={extractText} />
                    </div> */}
                    
                </div>
            </div>
       <div className="button">
  <button onClick={handleSubmit}>Start</button>
</div>




        </div>
    );
}

export default InterviewForm;
