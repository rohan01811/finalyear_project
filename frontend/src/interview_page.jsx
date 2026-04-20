import React from "react";
import Video from './components/video';
import { useRef , useState,useEffect } from "react";
import "./interview_page.css"
import { NavLink,useParams  } from "react-router-dom";
import Backtbtn from "./back";


const Interview = () => {
     const { sessionId } = useParams();
     const [violations, setViolations] = useState(0);
     const [popup, setPopup] = useState("");
     const [isInterviewStarted, setIsInterviewStarted] = useState(false);
const tabWarningShown = useRef(false);

    console.log("Session ID:", sessionId);
    const ws = useRef(null);
    const recognition = useRef(null);
    
    const [responseType, setResponseType] = useState(1); // 1: Expecting Question, 0: Expecting Response

    useEffect(() => {
 const handleVisibilityChange = () => {
if (document.hidden && !tabWarningShown.current && isInterviewStarted) {    triggerWarning("Tab switch detected");
    tabWarningShown.current = true;
  }
};

  

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, []);

const showPopup = (message) => {
  setPopup(message);

  setTimeout(() => {
    setPopup("");
  }, 3000); // auto hide
};

    const textToSpeech = (text) => {
        return new Promise((resolve, reject) => {
            const speech = new SpeechSynthesisUtterance(text);
            speech.onend = resolve;
            speech.onerror = reject;
            window.speechSynthesis.speak(speech);
        });
    };

const startListening = () => {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.error("Speech recognition not supported");
        return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognition.current = recognitionInstance;

    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = "en-US";

    let finalTranscript = "";
    let silenceTimer;

    recognitionInstance.start();

    recognitionInstance.onresult = (event) => {
        clearTimeout(silenceTimer);

        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalTranscript += transcript + " ";
            } else {
                interimTranscript += transcript;
            }
        }

        console.log("LIVE:", interimTranscript);

        // ⏳ silence detection
        silenceTimer = setTimeout(() => {
            recognitionInstance.stop();
        }, 3000);
    };

    recognitionInstance.onend = () => {
        const finalText = finalTranscript.trim() || "no answer";

        console.log("FINAL ANSWER:", finalText);

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(finalText);
        }

        finalTranscript = "";
    };

    recognitionInstance.onerror = (err) => {
        console.error("Speech error:", err);

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send("no answer");
        }
    };
};


   
   
    //  Start Interview Function
    const handleStartInterview = async () => {
  setIsInterviewStarted(true);   // ✅ start proctoring
   
  console.log("🚀 Interview Started");
        if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {

ws.current = new WebSocket(
  `ws://127.0.0.1:8000/api/interview/interview?session_id=${sessionId}`
);
ws.current.binaryType = "arraybuffer";  // 🔥 IMPORTANT
            console.log("Connnecte to websocket 1")
        }
        ws.current.onopen = () => console.log("Connected to interview WebSocket");
ws.current.onmessage = async (event) => {
  const audioBlob = new Blob([event.data], { type: "audio/mp3" });
  const audioUrl = URL.createObjectURL(audioBlob);

  const audio = new Audio(audioUrl);
  audio.play();

  audio.onended = () => {
    startListening();
  };
};
    };

    function endSession() {
    window.speechSynthesis.cancel();

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
    }

    setTimeout(() => {
        window.location.href = "/applications";
    }, 500); // allow graceful close
}

  const triggerWarning = (message) => {
  console.log("Malpractice detected, Focus on screen 🚨", message);

  setViolations((prev) => {
    const updated = prev + 1;

showPopup(message);
    // 🔊 Optional voice warning
    const speech = new SpeechSynthesisUtterance(message);

    // ❌ Auto terminate after 3
    if (updated >= 3) {
showPopup("Interview terminated due to malpractice");
      endSession();
    }

    return updated;
  });
};

    return (
        <div className = "body">
            {popup && (
  <div className="warning-popup">
    ⚠️ {popup}
  </div>
)}
           <div className="headers_interview_page">
                <NavLink to="/interviewForm"><Backtbtn /></NavLink>
            </div>
            <div className="interviewInstruction">
                <p>1. Press Ready to start interview and end session to end the session</p>
                <p>2. Response depends on internet speed and may take minutes in some cases</p>
            </div>
                <h1>Real Time Interview with face analysis</h1>           
            <div className="video">
                <div className="video-container">

<Video triggerWarning={triggerWarning} isActive={isInterviewStarted} autoPlay playsInline width="700" height="500" />
  <div className="face-guide"></div>

</div>
            </div>
            
            <div className="buttons">
  {!isInterviewStarted ? (
    <button onClick={handleStartInterview}>Start Interview</button>
  ) : (
   <NavLink to="/applications"><button onClick={endSession}>End Interview</button></NavLink>
  )}
</div>          
        </div>
    )
}

export default Interview