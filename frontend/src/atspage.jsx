import React from "react";
import "./atspage.css"
import { useState, useRef } from "react";
import axios from "axios";

import ReactMarkdown from "react-markdown";
import { NavLink } from "react-router-dom";
import Backtbtn from "./back";



function Ats() {
    const [resume, setResume] = useState(null)
    const [description, setDescription] = useState(null)
    const [result, setResult] = useState("Analyse your resume with Google gemini 2.0 Flash Multimodel..")

    function handelResume(e) {
        setResume(e.target.files[0]);
    }

    function handleDescription(e) {
        setDescription(e.target.value)
    }

    
async function sendData(prompt) {
    if (resume == null) {
        setResult("Please upload resume")
        return
    }
    if (description == null) {
        setResult("Please provide description")
        return
    }

    setResult("Your response is being generated...")

    const formdata = new FormData()
    formdata.append("ATSdescription", description)
    formdata.append("prompt_number", prompt)
    formdata.append("file", resume)

    // ✅ Correct endpoint
const session = JSON.parse(localStorage.getItem("session"));
const token = session?.access_token;

await axios.post(
  'http://127.0.0.1:8000/ats/upload',
  formdata,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);
    // ✅ Correct endpoint
    const response = await axios.post('http://127.0.0.1:8000/ats/analyze')

    setResult(response.data.result)   // because backend returns { status, result }
}

    return (
        <div className="ats">
            <div className="headers_ats_page">
                <NavLink to="/"><Backtbtn /></NavLink>
            </div>
                <h1>ATS Checking with HR Thoughts</h1>
            
            <div className="resume">    
            <label htmlFor="" >Upload your resume</label>
            <input onChange={handelResume} type="file" />
            </div>
           
           <div className="descriptions">
           <textarea name="" onChange={handleDescription} id="" placeholder="Enter Job Descriptions..." />
           </div>
            <div className="buttons">
                <button onClick={() =>sendData(1)}>HR Thoughts</button>
                <button onClick={() =>sendData(2)}>ATS Checking</button>

            </div>
           
            <div className="results">
                <ReactMarkdown>{result}</ReactMarkdown>
            </div>
        </div>
    )
}

export default Ats;

