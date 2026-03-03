import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "./video.css";

const Video = () => {
  const { sessionId } = useParams();   // ✅ Get session ID from route

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ws = useRef(null);
  const stream = useRef(null);

  const [emotion, setEmotion] = useState("Connecting to face analysis...");
  const [eyeContact, setEyeContact] = useState("");

  // ===============================
  // CONNECT TO VIDEO WEBSOCKET
  // ===============================
  useEffect(() => {
    if (!sessionId) return;

    ws.current = new WebSocket(
      `ws://127.0.0.1:8000/api/interview/video?session_id=${sessionId}
`
    );

    ws.current.onopen = () => {
      console.log("Video WebSocket Connected");
      setEmotion("Camera connected. Analyzing...");
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Video Backend Response:", data);

        setEmotion(data.emotion || "Analyzing...");
        setEyeContact(
          data.eye_contact === false
            ? "Eye Contact not maintained"
            : ""
        );
      } catch (err) {
        console.log("Invalid JSON from backend");
      }
    };

    ws.current.onerror = (error) => {
      console.log("Video WebSocket Error:", error);
    };

    ws.current.onclose = () => {
      console.log("Video WebSocket Disconnected");
      setEmotion("Video connection closed");
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [sessionId]);

  // ===============================
  // START CAMERA
  // ===============================
  useEffect(() => {
    const startCamera = async () => {
      try {
        stream.current = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream.current;
        }
      } catch (error) {
        console.log("Error accessing camera:", error);
      }
    };

    startCamera();

    return () => {
      if (stream.current) {
        stream.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // ===============================
  // CAPTURE FRAME EVERY 3 SECONDS
  // ===============================
  useEffect(() => {
    const interval = setInterval(() => {
      captureImage();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const captureImage = async () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !ws.current ||
      ws.current.readyState !== WebSocket.OPEN
    )
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (blob) {
          ws.current.send(blob);
        }
      },
      "image/jpeg",
      0.7
    );
  };

  return (
    <div>
      <div className="face_analysis">
        <div className="emotions">
          <strong>Emotion:</strong> {emotion}
        </div>
        <div className="eye_contact">
          <strong>Status:</strong> {eyeContact}
        </div>
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="700px"
        height="500px"
        style={{ border: "1px solid black" }}
      ></video>

      <canvas
        ref={canvasRef}
        width="700"
        height="500"
        style={{ display: "none" }}
      ></canvas>
    </div>
  );
};

export default Video;
