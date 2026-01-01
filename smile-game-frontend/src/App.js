import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { NavBar } from "./components/NavBar";
import { Banner } from "./components/Banner";
import Auth from "./pages/auth/Auth";
import Quiz from "./pages/quiz/quiz";
import GameOver from "./pages/game-over/game-over";
import PointTable from "./pages/point-table/point-table";
import Verification from "./pages/verification/verification";
import { api } from "./utils/api";

function App() {
  const location = useLocation();

  useEffect(() => {
  }, []);

  // Show navbar on all pages except during active quiz for maximum screen immersion
  const showNavbar = location.pathname !== '/quiz';

  return (
    <div className="smiley-game-app">
      {/* Background Starfield & Ambient Glows */}
      <div className="cosmic-bg-overlay"></div>
      <div className="glow-orb orb-cyan"></div>
      <div className="glow-orb orb-purple"></div>

      {showNavbar && <NavBar />}

      <main className={`app-main-content ${showNavbar ? 'with-nav' : 'full-screen'}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Banner />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/end" element={<GameOver />} />
          <Route path="/point-table" element={<PointTable />} />
          <Route path="/register-complete" element={<Verification />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
