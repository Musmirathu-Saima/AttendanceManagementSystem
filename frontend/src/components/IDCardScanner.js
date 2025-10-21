import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const API = `${BACKEND_URL}/api`;

export const IDCardScanner = ({ faceData, onComplete, onBack }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Start and stop camera properly on mount/unmount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('❌ Failed to access camera. Please grant camera permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setLoading(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;

    // ✅ Fix: ensure video dimensions are available
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('Failed to create image blob');
        setLoading(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', blob, 'idcard.jpg');

        const response = await axios.post(`${API}/id-card-ocr`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        setResult(response.data);
        setLoading(false);

        if (response.data?.success) {
          // ✅ Add a slight delay for better UX before marking complete
          setTimeout(async () => {
            await recordAttendance(faceData, response.data);
            stopCamera();
            onComplete?.(response.data);
          }, 1500);
        }
      } catch (error) {
        console.error('Error scanning ID card:', error);
        setResult({
          success: false,
          message: '⚠️ Error processing ID card. Please try again.',
        });
        setLoading(false);
      }
    }, 'image/jpeg');
  };

  const recordAttendance = async (faceData, idData) => {
    try {
      const attendanceData = {
        student_name: faceData?.name || 'Unknown',
        face_confidence: faceData?.confidence,
        id_card_text: idData?.text,
        id_card_name: idData?.parsed?.name,
        id_card_number: idData?.parsed?.id_number,
        verified: !!(faceData?.success && idData?.success),
      };

      await axios.post(`${API}/attendance/record`, attendanceData);
    } catch (error) {
      console.error('Error recording attendance:', error);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      }}
    >
      <div
        className="bg-black bg-opacity-60 backdrop-blur-md rounded-2xl p-8 max-w-3xl w-full mx-4 shadow-lg"
        style={{
          boxShadow: '0 6px 25px rgba(0, 255, 200, 0.4)',
        }}
      >
        <h2
          className="text-4xl font-bold text-center mb-6"
          style={{
            background: 'linear-gradient(90deg, #2ecc71, #00e6e6, #3498db)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🪪 ID Card Scanner
        </h2>

        {faceData && (
          <div
            className="mb-4 p-4 bg-green-500 bg-opacity-20 rounded-lg border border-green-500"
            data-testid="face-match-info"
          >
            <p className="text-green-300 text-center">
              ✅ Face Matched: <span className="font-bold">{faceData.name}</span> (
              {faceData.confidence}%)
            </p>
          </div>
        )}

        <div className="relative mb-6" data-testid="id-video-container">
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
          <canvas ref={canvasRef} className="hidden" />

          {result && (
            <div
              className={`absolute top-4 left-4 right-4 p-4 rounded-lg ${
                result.success ? 'bg-green-500' : 'bg-red-500'
              } bg-opacity-90 max-h-64 overflow-y-auto`}
              data-testid="scan-result"
            >
              <p className="text-white text-lg font-bold mb-2">{result.message}</p>

              {result.parsed && (
                <div className="text-white text-sm">
                  {result.parsed.name && <p>Name: {result.parsed.name}</p>}
                  {result.parsed.id_number && <p>ID: {result.parsed.id_number}</p>}
                </div>
              )}

              {result.text && (
                <details className="mt-2">
                  <summary className="text-white cursor-pointer">View Full Text</summary>
                  <pre className="text-xs text-white mt-2 whitespace-pre-wrap">
                    {result.text}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onBack}
            className="px-8 py-3 rounded-full bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-all"
            data-testid="id-back-btn"
          >
            ← Back
          </button>
          <button
            onClick={captureAndScan}
            disabled={loading}
            className={`px-8 py-3 rounded-full font-semibold transition-all ${
              loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-400 to-green-400 hover:from-green-400 hover:to-cyan-400'
            } text-white`}
            data-testid="capture-id-btn"
          >
            {loading ? '⏳ Scanning...' : '📸 Capture & Scan ID'}
          </button>
        </div>

        <p className="text-center text-gray-300 mt-4">
          Hold your ID card in front of the camera and click capture
        </p>
      </div>
    </div>
  );
};
