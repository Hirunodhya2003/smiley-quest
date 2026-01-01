import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  PlayFill,
  TrophyFill,
  LightningChargeFill,
  ShieldFillCheck,
  StarFill,
  QuestionCircleFill,
  ArrowRight
} from "react-bootstrap-icons";
import { sound } from "../utils/audio";
import { api } from "../utils/api";
import { HowToPlayModal } from "./HowToPlayModal";

const AVATARS = ["😎", "🤠", "🤓", "🤖", "🦊", "🐱", "🚀", "🦁", "👾", "🎯"];

export const Banner = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(api.getCurrentUser());
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "😎");
  const [guestName, setGuestName] = useState(user?.username || "");
  const [isLoading, setIsLoading] = useState(false);
  const [topScores, setTopScores] = useState([]);
  const [showGuide, setShowGuide] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // If no user, default to a fun guest name
    if (!user) {
      const defaultGuest = api.setGuestUser("Player " + Math.floor(Math.random() * 900 + 100), "😎");
      setUser(defaultGuest);
      setGuestName(defaultGuest.username);
    } else {
      setSelectedAvatar(user.avatar || "😎");
      setGuestName(user.username || "Player");
    }

    // Load top scores preview
    api.getTopScores()
      .then(scores => {
        if (scores && scores.length > 0) {
          setTopScores(scores.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const handleAvatarSelect = (avatar) => {
    sound.playClick();
    setSelectedAvatar(avatar);
    if (user) {
      const updated = { ...user, avatar };
      localStorage.setItem("User", JSON.stringify(updated));
      setUser(updated);
      window.dispatchEvent(new Event('auth-change'));
    }
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setGuestName(name);
    if (user) {
      const updated = { ...user, username: name };
      localStorage.setItem("User", JSON.stringify(updated));
      setUser(updated);
      window.dispatchEvent(new Event('auth-change'));
    }
  };

  const handleStartGame = async () => {
    sound.playClick();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await api.startGame();
      sound.playKey(5);
      navigate("/quiz");
    } catch (err) {
      console.error("Game start error:", err);
      setErrorMsg("Failed to start game session. Ensure the local backend is running!");
      setIsLoading(false);
    }
  };

  const getTierBadge = (tier) => {
    const t = tier || "Silver";
    return (
      <span className={`rank-badge-pill rank-${t.toLowerCase()}`}>
        <ShieldFillCheck size={13} className="me-1" />
        {t}
      </span>
    );
  };

  return (
    <div className="game-lobby-hero">
      <Container className="py-5">
        {/* Floating Ambient Emojis */}
        <div className="ambient-emoji emoji-float-1">😃</div>
        <div className="ambient-emoji emoji-float-2">😎</div>
        <div className="ambient-emoji emoji-float-3">🤩</div>

        <Row className="align-items-center g-5 pt-4">
          {/* Left Column: Hero & Action */}
          <Col lg={7} className="text-center text-lg-start">
            <div className="d-inline-flex align-items-center gap-2 hero-tag mb-3">
              <span className="live-dot"></span>
              <span>Next-Gen Math Puzzle Arcade</span>
            </div>

            <h1 className="hero-title mb-3">
              Decode The Smilies. <br />
              <span className="gradient-text-arcade">Conquer The Clock!</span>
            </h1>

            <p className="hero-description mb-4">
              Solve addictive smiley math logic equations in real-time. Boost your combo streaks, rank up from Silver to Master Tier, and claim your crown on the global leaderboard!
            </p>

            {/* Error notice if backend unreachable */}
            {errorMsg && (
              <div className="alert alert-danger py-2 px-3 mb-4 rounded-3 d-inline-block">
                {errorMsg}
              </div>
            )}

            {/* Player Configuration Card */}
            <div className="glass-player-card mb-4">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div className="d-flex align-items-center gap-3">
                  <span className="hero-avatar-display">{selectedAvatar}</span>
                  <div>
                    <label className="text-secondary small d-block text-start">PLAYER CODENAME</label>
                    <input
                      type="text"
                      className="form-control-player-name"
                      value={guestName}
                      onChange={handleNameChange}
                      placeholder="Enter Player Name..."
                      maxLength={20}
                    />
                  </div>
                </div>

                <div className="text-end">
                  <label className="text-secondary small d-block">TIER RANK</label>
                  {getTierBadge(user?.userDetails?.level_eum)}
                </div>
              </div>

              {/* Avatar Selector Row */}
              <div className="avatar-picker-row">
                <span className="small text-secondary me-2">Pick Avatar:</span>
                <div className="d-flex gap-2 flex-wrap">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      className={`btn-avatar-choice ${selectedAvatar === av ? 'active' : ''}`}
                      onClick={() => handleAvatarSelect(av)}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Buttons */}
            <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
              <button
                className="btn-arcade-play"
                onClick={handleStartGame}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <PlayFill size={28} className="me-1" />
                    PLAY NOW (60s)
                  </>
                )}
              </button>

              <button
                className="btn-arcade-outline"
                onClick={() => { sound.playClick(); navigate('/point-table'); }}
              >
                <TrophyFill size={18} className="me-2 text-warning" />
                Leaderboard
              </button>

              <button
                className="btn-arcade-ghost"
                onClick={() => { sound.playClick(); setShowGuide(true); }}
              >
                <QuestionCircleFill size={18} className="me-2 text-info" />
                Rules
              </button>
            </div>
          </Col>

          {/* Right Column: Live Showcase & Podium */}
          <Col lg={5}>
            <div className="hero-right-card">
              {/* Card Header */}
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-2">
                  <TrophyFill size={20} color="#f59e0b" />
                  <span className="fw-bold tracking-wide">HALL OF FAME</span>
                </div>
                <Badge bg="dark" className="border border-warning text-warning px-2 py-1">
                  TOP PLAYERS
                </Badge>
              </div>

              {/* Top 3 Champions List */}
              <div className="champion-preview-list mb-4">
                {topScores.length > 0 ? (
                  topScores.map((s, idx) => (
                    <div key={s.id || idx} className={`champion-row-item champion-rank-${idx + 1}`}>
                      <div className="d-flex align-items-center gap-3">
                        <span className="champion-rank-number">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                        </span>
                        <div>
                          <div className="fw-bold text-light">{s.userName}</div>
                          <small className="text-secondary">{s.level_eum || "Silver"} Tier</small>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="champion-points-val">{s.point} pts</div>
                        <small className="text-muted">High Score</small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-secondary">
                    <Spinner size="sm" animation="grow" className="me-2" />
                    Loading champions...
                  </div>
                )}
              </div>

              {/* Arcade Highlights Grid */}
              <div className="game-perks-grid">
                <div className="perk-box">
                  <LightningChargeFill size={18} color="#38bdf8" className="mb-1" />
                  <div className="perk-val">60 Sec</div>
                  <div className="perk-label">Sprint Timer</div>
                </div>

                <div className="perk-box">
                  <StarFill size={18} color="#f59e0b" className="mb-1" />
                  <div className="perk-val">+10 pts</div>
                  <div className="perk-label">Per Puzzle</div>
                </div>

                <div className="perk-box">
                  <ShieldFillCheck size={18} color="#10b981" className="mb-1" />
                  <div className="perk-val">0 - 9</div>
                  <div className="perk-label">Single Digit</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 text-center">
                <button
                  className="btn btn-link text-info text-decoration-none small p-0"
                  onClick={() => { sound.playClick(); navigate('/point-table'); }}
                >
                  View Full Leaderboard Rankings <ArrowRight size={14} className="ms-1" />
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Tutorial Modal */}
      <HowToPlayModal show={showGuide} onHide={() => setShowGuide(false)} />
    </div>
  );
};
