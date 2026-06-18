🧠 AI-Powered Mock Interview Platform
A full-stack AI-powered mock interview platform designed to simulate realistic interview experiences and provide intelligent, actionable feedback using cutting-edge AI tools.

🔥 Features
🎯 Dynamic Question Generation
Generates context-aware interview questions using GPT-4o Mini via LangChain, tailored to the user's domain and experience level.

📸 Real-Time Engagement Analysis
Monitors and evaluates user attention and emotion during interviews using OpenCV and DeepFace.

📝 Resume Scoring & Feedback
Uses Gemini 2.0 Flash to perform ATS-based resume analysis and provide HR-style feedback for improvements.

🔍 AI-Driven Job Recommendations
Matches jobs using JSearch API, personalized by parsing the uploaded resume.

📧 Automated Email Notifications
Sends project informations to users via email.

🧱 Tech Stack
Frontend	Backend	AI & CV	Database	Integration
React.js	FastAPI / Node.js	GPT-4o Mini (LangChain)	MongoDB	Gemini 2.0 Flash
Tailwind CSS	RESTful APIs	OpenCV + DeepFace		JSearch API

📦 Installation

# Clone the repository
git clone https://github.com/your-username/ai-mock-interview-platform.git
cd ai-mock-interview-platform

# Frontend Setup
cd frontend
npm install
npm run dev

# Backend Setup (FastAPI)

# FastAPI
cd backend
pip install -r requirements.txt
uvicorn main:app --reload


💡 Use Cases
Students preparing for placements

Job seekers wanting feedback on interview performance

Resume analysis and job matching
