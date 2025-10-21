// import { useEffect } from "react";
// import { useState } from "react";
import "./App.css";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import axios from "axios";

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
// const API = `${BACKEND_URL}/api`;

// const Home = () => {
//   const helloWorldApi = async () => {
//     try {
//       const response = await axios.get(`${API}/`);
//       console.log(response.data.message);
//     } catch (e) {
//       console.error(e, `errored out requesting / api`);
//     }
//   };

//   useEffect(() => {
//     helloWorldApi();
//   }, []);

//   return (
//     <div>
//       <header className="App-header">
//         <a
//           className="App-link"
//           href="https://emergent.sh"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <img src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" />
//         </a>
//         <p className="mt-5">Building something incredible ~!</p>
//       </header>
//     </div>
//   );
// };

// function App() {
//   return (
//     <div className="App">
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Home />}>
//             <Route index element={<Home />} />
//           </Route>
//         </Routes>
//       </BrowserRouter>
//     </div>
//   );
// }

// export default App;

import React, { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { FaceRecognition } from "./components/FaceRecognition";
import { IDCardScanner } from "./components/IDCardScanner";
import { AttendanceSuccess } from "./components/AttendanceSuccess";

function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [faceData, setFaceData] = useState(null);
  const [idData, setIdData] = useState(null);

  const handleStartFaceRecognition = () => {
    setCurrentView("face-recognition");
    setFaceData(null);
    setIdData(null);
  };

  const handleStartIDScan = () => {
    setCurrentView("id-scanner");
    setFaceData(null);
    setIdData(null);
  };

  const handleFaceComplete = (data) => {
    setFaceData(data);
    setCurrentView("id-scanner");
  };

  const handleIDComplete = (data) => {
    setIdData(data);
    setCurrentView("success");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setFaceData(null);
    setIdData(null);
  };

  return (
    <div className="App">
      {currentView === "dashboard" && (
        <Dashboard
          onStartFaceRecognition={handleStartFaceRecognition}
          onStartIDScan={handleStartIDScan}
        />
      )}

      {currentView === "face-recognition" && (
        <FaceRecognition
          onComplete={handleFaceComplete}
          onBack={handleBackToDashboard}
        />
      )}

      {currentView === "id-scanner" && (
        <IDCardScanner
          faceData={faceData}
          onComplete={handleIDComplete}
          onBack={handleBackToDashboard}
        />
      )}

      {currentView === "success" && (
        <AttendanceSuccess
          faceData={faceData}
          idData={idData}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </div>
  );
}

export default App;
