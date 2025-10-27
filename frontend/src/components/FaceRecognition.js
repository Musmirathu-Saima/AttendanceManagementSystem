// import React, { useRef, useState, useEffect } from "react";
// import "./index.css"

// export const FaceRecognition = ({ onComplete, onBack }) => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
//       videoRef.current.srcObject = stream;
//     });
//   }, []);

//   const handleCapture = async () => {
//     const canvas = canvasRef.current;
//     const video = videoRef.current;
//     const ctx = canvas.getContext("2d");

//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg"));

//     const formData = new FormData();
//     formData.append("file", blob, "frame.jpg");

//     try {
//       const res = await fetch("http://localhost:5000/api/face-recognition", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();

//       if (data.success) {
//         setMessage(`${data.message} (Confidence: ${data.confidence}%)`);
//         onComplete(data);
//       } else {
//         setMessage(data.message || "❌ Face not recognized");
//       }
//     } catch (err) {
//       setMessage("⚠️ Error processing image: " + err.message);
//     }
//   };

//   return (
//     <div style={{ textAlign: "center", color: "white" }}>
//       <h2>Face Recognition</h2>
//       <video ref={videoRef} width="480" height="360" autoPlay />
//       <br />
//       <canvas ref={canvasRef} width="480" height="360" style={{ display: "none" }} />
//       <br />
//       <button onClick={handleCapture}>📸 Capture & Recognize</button>
//       <button onClick={onBack} style={{ marginLeft: "10px" }}>⬅ Back</button>
//       <p>{message}</p>
//     </div>
//   );
// };
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./index.css";

export const FaceRecognition = ({ onComplete, onBack }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  }, []);

  const handleCapture = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );

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
    <div className="face-bg">
      <motion.div
        className="face-container"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="face-title">Face Recognition</h2>

        <div className="video-frame">
          <video ref={videoRef} width="600" height="440" autoPlay />
          <canvas
            ref={canvasRef}
            width="600"
            height="440"
            style={{ display: "none" }}
          />
        </div>

        <div className="button-group">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="glow-btn"
            onClick={handleCapture}
          >
            📸 Capture & Recognize
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="glow-btn back"
            onClick={onBack}
          >
            ⬅ Back
          </motion.button>
        </div>

        <p className="face-message">{message}</p>
      </motion.div>
    </div>
  );
};
