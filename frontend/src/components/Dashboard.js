import React, { useEffect, useState } from 'react'
import axios from 'axios'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Dashboard = ({ onStartFaceRecognition, onStartIDScan }) => {
  const [stats, setStats] = useState({
    total_students: 120,
    on_time_percentage: 92,
    on_time_today: 110,
    late_today: 10,
    present_today: 110
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/attendance/stats`);
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      animation: 'gradientFlow 20s ease infinite'
    }}>
      <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes moveAcross {
          0% { left: -500px; opacity: 0.3; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { left: 110%; opacity: 0.3; }
        }

        .robot-bg {
          position: absolute;
          width: 400px;
          height: 400px;
          opacity: 0.2;
          z-index: 0;
          animation: moveAcross 15s linear infinite;
        }
      `}</style>

      {/* Robot backgrounds */}
      <div className="robot-bg" style={{ top: '10%', animationDelay: '0s' }} />
      <div className="robot-bg" style={{ top: '30%', animationDelay: '3s' }} />
      <div className="robot-bg" style={{ top: '55%', animationDelay: '6s' }} />
      <div className="robot-bg" style={{ top: '75%', animationDelay: '9s' }} />

      <div className="container relative z-10 mx-auto px-6 py-8">
        {/* Header */}
        <header className="text-center p-6 bg-black bg-opacity-60 backdrop-blur-md rounded-2xl mb-8 shadow-2xl" style={{
          boxShadow: '0 6px 25px rgba(0, 255, 200, 0.4)'
        }}>
          <h1 className="text-5xl font-bold mb-3" style={{
            background: 'linear-gradient(90deg, #2ecc71, #00e6e6, #3498db)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '1px'
          }}>
            🤖 Student Attendance Management System
          </h1>
          <p className="text-xl text-gray-300">
            Futuristic AI-Powered Attendance with Face & ID Recognition
          </p>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard title="Total Students" value={stats.total_students} />
          <DashboardCard title="On Time %" value={`${stats.on_time_percentage}%`} />
          <DashboardCard title="On Time Today" value={stats.on_time_today} />
          <DashboardCard title="Late Today" value={stats.late_today} />
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-8">
          <button
            onClick={onStartFaceRecognition}
            className="futuristic-btn mx-4"
            data-testid="facial-recognition-btn"
          >
            Facial Recognition
          </button>
          <button
            onClick={onStartIDScan}
            className="futuristic-btn mx-4"
            data-testid="id-card-detection-btn"
          >
            ID Card Detection
          </button>
        </div>
      </div>

      <style>{`
        .futuristic-btn {
          background: linear-gradient(90deg, #00f7ff, #2ecc71, #3498db);
          border: none;
          border-radius: 35px;
          color: white;
          padding: 15px 40px;
          font-size: 1.2rem;
          margin: 15px;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(0, 255, 200, 0.4);
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .futuristic-btn:hover {
          background: linear-gradient(90deg, #2ecc71, #00f7ff, #2980b9);
          transform: scale(1.1);
          box-shadow: 0 12px 30px rgba(0, 255, 200, 0.6);
        }
      `}</style>
    </div>
  );
};

const DashboardCard = ({ title, value }) => {
  return (
    <div
      className="bg-white bg-opacity-5 rounded-2xl p-6 text-center transition-all duration-300 hover:transform hover:-translate-y-2"
      style={{
        boxShadow: '0 6px 25px rgba(0, 255, 200, 0.25)',
        border: '1px solid rgba(0, 255, 200, 0.3)'
      }}
      data-testid={`card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <h2 className="text-2xl font-semibold mb-3" style={{ color: '#00f7ff' }}>
        {title}
      </h2>
      <p className="text-3xl font-bold" style={{ color: '#2ecc71' }}>
        {value}
      </p>
    </div>
  );
};
