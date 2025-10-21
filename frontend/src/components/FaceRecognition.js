import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const FaceRecognition = ({ onComplete, onBack }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [result, setResult] = useState(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Failed to access camera. Please ensure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      try {
        const formData = new FormData();
        formData.append('file', blob, 'face.jpg');

        const response = await axios.post(`${API}/face-recognition`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setResult(response.data);
        setLoading(false);

        if (response.data.success) {
          setTimeout(() => {
            stopCamera();
            onComplete(response.data);
          }, 2000);
        }
      } catch (error) {
        console.error('Error recognizing face:', error);
        setResult({
          success: false,
          message: 'Error processing face recognition'
        });
        setLoading(false);
      }
    }, 'image/jpeg');
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'
      }}
    >
      <div
        className="bg-black bg-opacity-60 backdrop-blur-md rounded-2xl p-8 max-w-3xl w-full mx-4"
        style={{
          boxShadow: '0 6px 25px rgba(0, 255, 200, 0.4)'
        }}
      >
        <h2
          className="text-4xl font-bold text-center mb-6"
          style={{
            background: 'linear-gradient(90deg, #2ecc71, #00e6e6, #3498db)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          👤 Face Recognition
        </h2>

        <div className="relative mb-6" data-testid="video-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg"
            style={{ transform: 'scaleX(-1)' }}
          />
          <canvas ref={canvasRef} className="hidden" />

          {result && (
            <div
              className={`absolute top-4 left-4 right-4 p-4 rounded-lg ${
                result.success ? 'bg-green-500' : 'bg-red-500'
              } bg-opacity-90`}
              data-testid="recognition-result"
            >
              <p className="text-white text-xl font-bold">{result.message}</p>
              {result.confidence && (
                <p className="text-white">Confidence: {result.confidence}%</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onBack}
            className="px-8 py-3 rounded-full bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-all"
            data-testid="back-btn"
          >
            ← Back
          </button>
          <button
            onClick={captureAndRecognize}
            disabled={loading}
            className={`px-8 py-3 rounded-full font-semibold transition-all ${
              loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-400 to-green-400 hover:from-green-400 hover:to-cyan-400'
            } text-white`}
            data-testid="capture-face-btn"
          >
            {loading ? 'Processing...' : '📸 Capture & Recognize'}
          </button>
        </div>

        <p className="text-center text-gray-300 mt-4">
          Position your face in the camera and click capture
        </p>
      </div>
    </div>
  );
};
