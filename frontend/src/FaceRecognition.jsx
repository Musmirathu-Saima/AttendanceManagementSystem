import React, { useRef, useState } from "react";

export default function FaceRecognition() {
  const videoRef = useRef(null);
  const [result, setResult] = useState("");

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const captureAndSend = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");
      const res = await fetch("http://localhost:5000/face-recognition", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.match) {
        setResult(`✅ Face recognized: ${data.name}`);
      } else {
        setResult(`❌ ${data.message}`);
      }
    }, "image/jpeg");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="400"
        style={{ borderRadius: "10px", boxShadow: "0 0 10px #aaa" }}
      />
      <div style={{ marginTop: "1rem" }}>
        <button onClick={startCamera} style={{ marginRight: "10px" }}>
          Start Camera
        </button>
        <button onClick={captureAndSend}>Capture & Recognize</button>
      </div>
      <p style={{ fontSize: "18px", marginTop: "1rem" }}>{result}</p>
    </div>
  );
}
