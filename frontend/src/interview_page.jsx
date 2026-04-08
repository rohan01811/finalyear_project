import React from "react";
import Video from './components/video';
import { useRef , useState } from "react";
import "./interview_page.css"
import { NavLink,useParams  } from "react-router-dom";
import Backtbtn from "./back";


const Interview = () => {
     const { sessionId } = useParams();
    console.log("Session ID:", sessionId);
    const ws = useRef(null);
    const recognition = useRef(null);
    
    const [responseType, setResponseType] = useState(1); // 1: Expecting Question, 0: Expecting Response


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
    setTimeout(() => {
        startListening();
    }, 1000); // prevents overlap issues
};
};
    };

    function endSession(){
        window.speechSynthesis.cancel();
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.close();
            console.log("WebSocket closed.");
        }
        
    }

    return (
        <div className = "body">
           <div className="headers_interview_page">
                <NavLink to="/interviewForm"><Backtbtn /></NavLink>
            </div>
            <div className="interviewInstruction">
                <p>1. Press Ready to start interview and end session to end the session</p>
                <p>2. Response depends on internet speed and may take minutes in some cases</p>
            </div>
                <h1>Real Time Interview with face analysis</h1>           
            <div className="video">
                <Video />
            </div>
            
            <div className="buttons">
                <button onClick={handleStartInterview}>Ready</button>            
                <NavLink to="/applications"><button onClick={endSession}>End Session</button></NavLink>
            </div>            
        </div>
    )
}

export default Interview