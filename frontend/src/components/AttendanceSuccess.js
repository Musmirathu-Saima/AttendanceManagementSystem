import React from 'react';

export const AttendanceSuccess = ({ faceData, idData, onBackToDashboard }) => {
  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      }}
    >
      <div
        className="bg-black bg-opacity-60 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full mx-4 text-center"
        style={{
          boxShadow: '0 6px 25px rgba(0, 255, 200, 0.4)',
        }}
      >
        <div className="text-6xl mb-4">✅</div>

        <h2
          className="text-4xl font-bold mb-6"
          style={{
            background: 'linear-gradient(90deg, #2ecc71, #00e6e6, #3498db)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Attendance Recorded Successfully!
        </h2>

        <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-6 text-left">
          <h3 className="text-2xl font-semibold text-cyan-400 mb-4">
            Verification Details
          </h3>

          <div className="mb-4">
            <p className="text-gray-300 mb-2">
              👤 <span className="font-semibold">Face Recognition:</span>
            </p>
            <p className="text-white ml-6">
              Student:{' '}
              <span className="text-green-400 font-bold">
                {faceData?.name || 'Unknown'}
              </span>
            </p>
            <p className="text-white ml-6">
              Confidence:{' '}
              <span className="text-green-400 font-bold">
                {faceData?.confidence ?? 'N/A'}%
              </span>
            </p>
          </div>

          <div className="mb-4">
            <p className="text-gray-300 mb-2">
              🪪 <span className="font-semibold">ID Card Verification:</span>
            </p>
            {idData?.parsed?.name && (
              <p className="text-white ml-6">
                Name:{' '}
                <span className="text-green-400 font-bold">
                  {idData.parsed.name}
                </span>
              </p>
            )}
            {idData?.parsed?.id_number && (
              <p className="text-white ml-6">
                ID Number:{' '}
                <span className="text-green-400 font-bold">
                  {idData.parsed.id_number}
                </span>
              </p>
            )}
          </div>

          <div>
            <p className="text-gray-300">
              🕒 <span className="font-semibold">Timestamp:</span>{' '}
              <span className="text-white">
                {new Date().toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={onBackToDashboard}
          className="px-12 py-4 rounded-full bg-gradient-to-r from-cyan-400 to-green-400 text-white font-bold text-xl hover:from-green-400 hover:to-cyan-400 transition-all shadow-lg"
          data-testid="back-to-dashboard-btn"
        >
          🏠 Back to Dashboard
        </button>
      </div>
    </div>
  );
};
