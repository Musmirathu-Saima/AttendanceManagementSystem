import React, { useRef, useState, useEffect } from "react";

export const FaceRecognition = ({ onComplete, onBack }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      videoRef.current.srcObject = stream;
    });
  }, []);

  const handleCapture = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg"));

    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    try {
      const res = await fetch("http://localhost:5000/api/face-recognition", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`${data.message} (Confidence: ${data.confidence}%)`);
        onComplete(data);
      } else {
        setMessage(data.message || "❌ Face not recognized");
      }
    } catch (err) {
      setMessage("⚠️ Error processing image: " + err.message);
    }
  };

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h2>Face Recognition</h2>
      <video ref={videoRef} width="480" height="360" autoPlay />
      <br />
      <canvas ref={canvasRef} width="480" height="360" style={{ display: "none" }} />
      <br />
      <button onClick={handleCapture}>📸 Capture & Recognize</button>
      <button onClick={onBack} style={{ marginLeft: "10px" }}>⬅ Back</button>
      <p>{message}</p>
    </div>
  );
};
