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

    const startListening = async () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = false;
        recognition.current.interimResults = false;
        recognition.current.lang = "en-US";
        await recognition.current.start();

        recognition.current.onresult = async (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            console.log("Recognized:", transcript);

            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
              await  ws.current.send(transcript);
            } else {
                console.warn("WebSocket is not open. Could not send answer.");
            }
        };
    };

    //  Start Interview Function
    const handleStartInterview = async () => {

        if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {

ws.current = new WebSocket(
  `ws://127.0.0.1:8000/api/interview/interview?session_id=${sessionId}`
);
            console.log("Connnecte to websocket 1")
        }
        ws.current.onopen = () => console.log("Connected to interview WebSocket");
        ws.current.onmessage = async (event) => {
            const eventdata = event.data.trim();
            if (responseType === 1) {

                await textToSpeech(eventdata);
                setResponseType(0);
                startListening();
            } else {
                await textToSpeech(eventdata);
                setResponseType(1);
            }
        };
    };

    function endSession(){
        window.speechSynthesis.cancel();
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.close();
            console.log("WebSocket closed.");
        }
        fetch("http://127.0.0.1:8000/clearData",{method : "POST"}).then("Data cleared sucessfully")
        
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
                <NavLink to="/interviewForm"><button onClick={endSession}>End Session</button></NavLink>
            </div>            
        </div>
    )
}

export default Interview