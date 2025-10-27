import React from "react";
import { motion } from "framer-motion";
import "./index.css";

export const AttendanceSuccess = ({ faceData, idData, onBackToDashboard }) => {
  return (
    <div className="success-bg">
      <motion.div
        className="success-card"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="success-icon"
          animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ✅
        </motion.div>

        <h2 className="success-title">Attendance Recorded Successfully!</h2>

        <div className="success-details">
          <h3 className="section-title">Verification Details</h3>

          <div className="info-block">
            <p>👤 <span>Face Recognition:</span></p>
            <p>
              Student:{" "}
              <span className="highlight-name">
                {faceData?.name || "Unknown"}
              </span>
            </p>
            <p>
              Confidence:{" "}
              <span className="highlight">
                {faceData?.confidence ?? "N/A"}%
              </span>
            </p>
          </div>

          <div className="info-block">
            <p>🪪 <span>ID Card Verification:</span></p>
            {idData?.parsed?.name && (
              <p>
                Name: <span className="highlight">{idData.parsed.name}</span>
              </p>
            )}
            {idData?.parsed?.id_number && (
              <p>
                ID Number:{" "}
                <span className="highlight">{idData.parsed.id_number}</span>
              </p>
            )}
          </div>

          <div className="info-block">
            <p>
              🕒 <span>Timestamp:</span>{" "}
              <span className="highlight">
                {new Date().toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          className="back-btn"
          onClick={onBackToDashboard}
        >
          🏠 Back to Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
};
