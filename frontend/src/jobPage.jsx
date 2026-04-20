import React, { useState,useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

// Placeholder for Backtbtn - replace with your actual component
const Backtbtn = () => <button style={{ padding: '10px 20px', cursor: 'pointer' }}>← Back</button>;

function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [isJobs, setIsJobs] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
const [appliedJobs, setAppliedJobs] = useState([]);

async function getValidToken() {
  const session = JSON.parse(localStorage.getItem("session"));

  if (!session) return null;

  const now = Math.floor(Date.now() / 1000);

  // ⏳ if expired
  if (session.expires_at <= now + 60) {
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          refresh_token: session.refresh_token
        })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("session", JSON.stringify(data.session));
        return data.session.access_token;
      } else {
        localStorage.clear();
        window.location.href = "/login";
        return null;
      }
    } catch (err) {
      console.error("Refresh failed", err);
      return null;
    }
  }

  return session.access_token;
}

useEffect(() => {
  const fetchAppliedJobs = async () => {
    try {
const token = await getValidToken();
      const res = await axios.get(
        "http://127.0.0.1:8000/jobs/my-applications",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAppliedJobs(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch applied jobs", error);
    }
  };

  fetchAppliedJobs();
}, []);

const handleApply = async (job) => {
  try {
const token = await getValidToken();
    const jobId = job.job_apply_link.split("/").pop(); // extract id

    const res = await axios.post(
      `http://127.0.0.1:8000/jobs/apply?job_id=${jobId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert(res.data.message);

    // still store locally for UI
 setAppliedJobs(prev => [...prev, { jobs: { id: jobId } }]);
  } catch (error) {
    console.error(error);
    alert("Application failed ❌");
  }
};

const isApplied = (job) => {
  return appliedJobs.some(
    (app) => app.jobs.id === job.job_apply_link.split("/").pop()
  );
};

    async function sendResume(event) {
        const file = event.target.files[0];
        
        // Validation
        if (!file) {
            setIsJobs("❌ Please select a file");
            return;
        }

        if (!file.name.endsWith('.pdf')) {
            setIsJobs("❌ Please upload a PDF file only");
            return;
        }

        setLoading(true);
        setIsJobs("🔄 Analyzing your resume and searching for jobs... This may take 1-2 minutes.");
        setUploadedFile(file.name);
        setJobs([]);

        try {
            const formdata = new FormData();
            formdata.append("resume", file);

            console.log("Sending resume:", file.name);

            const response = await axios.post(
                "http://127.0.0.1:8000/jobs/search", // Use local backend
                formdata,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    timeout: 120000, // 2 minutes timeout
                }
            );

            console.log("Response:", response.data);

            if (response.data.status === "success" && response.data.jobs && response.data.jobs.length > 0) {
                setJobs(response.data.jobs);
                setIsJobs(`✅ Found ${response.data.jobs.length} jobs matching your profile!`);
            } else if (response.data.status === "error") {
                setJobs([]);
                setIsJobs(`❌ Error: ${response.data.message}`);
            } else {
                setJobs([]);
                setIsJobs("⚠️ No jobs found. Try uploading a different resume or try again later.");
            }

        } catch (error) {
            console.error("Error:", error);
            
            if (error.response) {
                // Server responded with error
                setIsJobs(`❌ Server Error: ${error.response.data.message || error.response.statusText}`);
            } else if (error.request) {
                // Request made but no response
                setIsJobs("❌ Network Error: Could not connect to server. Make sure backend is running on http://127.0.0.1:8000");
            } else if (error.code === 'ECONNABORTED') {
                // Timeout
                setIsJobs("⏱️ Request timed out. The analysis is taking longer than expected. Please try again.");
            } else {
                setIsJobs(`❌ Error: ${error.message}`);
            }
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh',minWidth:'100vw', padding: '20px', backgroundColor: '#1a1a1a', color: 'white' }}>
            <div style={{ position: 'absolute', left: '30px', top: '30px' }}>
                <NavLink to="/">
                    <Backtbtn />
                </NavLink>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '60px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '40px' }}>FIND JOBS USING AI</h1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                <label style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    Upload Resume (PDF):
                </label>
                <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={sendResume}
                    disabled={loading}
                    style={{
                        padding: '10px',
                        borderRadius: '5px',
                        border: '2px solid #444',
                        backgroundColor: '#2a2a2a',
                        color: 'white',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                />
                {uploadedFile && (
                    <p style={{ color: '#4CAF50', fontSize: '0.9rem' }}>
                        📄 {uploadedFile}
                    </p>
                )}
            </div>

            {isJobs && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '1.2rem',
                    padding: '20px',
                    margin: '20px auto',
                    maxWidth: '800px',
                    backgroundColor: isJobs.includes('❌') ? '#ffebee' :
                                   isJobs.includes('✅') ? '#e8f5e9' :
                                   isJobs.includes('🔄') ? '#fff3e0' : '#f5f5f5',
                    color: isJobs.includes('❌') ? '#c62828' :
                           isJobs.includes('✅') ? '#2e7d32' :
                           isJobs.includes('🔄') ? '#e65100' : '#555',
                    borderRadius: '10px',
                    textAlign: 'center'
                }}>
                    {isJobs}
                </div>
            )}

            <div style={{
                display: 'grid',
                gap: '20px',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                padding: '20px',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {jobs.map((job, index) => (
                    <div
    key={index}
    style={{
        background: job.source === "internal"
            ? 'linear-gradient(135deg, #0d47a1, #1a1a1a)'
            : '#2a2a2a',
        borderRadius: '20px',
        padding: '20px',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: job.source === "internal"
            ? '0 0 15px rgba(33,150,243,0.7)'
            : '0 4px 6px rgba(0,0,0,0.3)',
        border: job.source === "internal"
            ? '2px solid #2196F3'
            : '1px solid #444'
    }}
>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            marginBottom: '15px',
                            paddingBottom: '15px',
                            borderBottom: '1px solid #444'
                        }}>
                            {job.employer_logo && (
                                <img
                                    src={job.employer_logo}
                                    alt={job.employer_name}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '5px',
                                        objectFit: 'contain',
                                        backgroundColor: 'white',
                                        padding: '5px'
                                    }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )}
                            <a
                                href={job.employer_website || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: '#64B5F6',
                                    textDecoration: 'none',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                {job.employer_name || 'Company'}
                            </a>

                            {job.source === "internal" && (
    <div style={{
        background: "#2196F3",
        padding: "5px 10px",
        borderRadius: "10px",
        fontSize: "12px",
        marginBottom: "10px",
        width: "fit-content"
    }}>
        🔥 Our Platform Job ({job.match_score}% match)
    </div>
)}
                        </div>

                        <p style={{ marginBottom: '10px', fontSize: '1rem' }}>
                            <strong>Role:</strong> {job.job_title || 'N/A'}
                        </p>

                        <p style={{ marginBottom: '10px', fontSize: '1rem' }}>
                            <strong>Location:</strong> {job.job_city && job.job_country
                                ? `${job.job_city}, ${job.job_country}`
                                : job.job_country || 'Remote'}
                        </p>

                        {job.job_employment_type && (
                            <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#aaa' }}>
                                <strong>Type:</strong> {job.job_employment_type}
                            </p>
                        )}

                       <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
    {job.source === "internal" ? (
        isApplied(job) ? (
            <button style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'gray',
                color: 'white',
                borderRadius: '8px',
                border: 'none'
            }}>
                Applied ✅
            </button>
        ) : (
            <button
                onClick={() => handleApply(job)}
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                Apply (Our Platform)
            </button>
        )
    ) : (
        <a
            href={job.job_apply_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
        >
            <button style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
            }}>
                Apply Now →
            </button>
        </a>
    )}
</div>
                    </div>
                ))}
            </div>

            {!loading && jobs.length === 0 && !isJobs && (
                <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#7B7B7B',
                    fontSize: '1.1rem'
                }}>
                    📄 Upload your resume to find matching jobs
                </div>
            )}

            <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                color: '#7B7B7B',
                padding: '30px',
                marginTop: '40px',
                fontSize: '0.9rem'
            }}>
                <p>ℹ️ Job analysis may take 1-2 minutes after resume upload</p>
            </div>
        </div>
    );
}

export default Jobs;