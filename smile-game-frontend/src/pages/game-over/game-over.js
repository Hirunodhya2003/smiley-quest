import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner, ProgressBar } from "react-bootstrap";
import {
  TrophyFill,
  ArrowRepeat,
  HouseDoorFill,
  LightningChargeFill,
  CheckCircleFill,
  StarFill,
  AwardFill,
  ShareFill,
  Fire
} from "react-bootstrap-icons";
import { api } from "../../utils/api";
import { sound } from "../../utils/audio";
import { fireConfetti } from "../../utils/confetti";

export default function GameOver() {
  const navigate = useNavigate();

  const [points, setPoints] = useState(() => parseInt(sessionStorage.getItem("POINTS") || "0", 10));
  const correctCount = parseInt(sessionStorage.getItem("CORRECT_COUNT") || "0", 10);
  const totalAttempts = parseInt(sessionStorage.getItem("TOTAL_ATTEMPTS") || "0", 10);
  const maxStreak = parseInt(sessionStorage.getItem("MAX_STREAK") || "0", 10);

  const [isRestarting, setIsRestarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  // Check personal best and celebration
  useEffect(() => {
    const prevBest = parseInt(localStorage.getItem("PERSONAL_BEST") || "0", 10);
    if (points > prevBest) {
      localStorage.setItem("PERSONAL_BEST", String(points));
      setIsNewBest(true);
    }

    if (points >= 20) {
      sound.playFanfare();
      setTimeout(() => fireConfetti(points >= 50 ? 90 : 50), 200);
    } else {
      sound.playGameOver();
    }

    // Persist score
    const sId = sessionStorage.getItem("SCORE_ID");
    const detailsId = sessionStorage.getItem("SCORE_DETAILS_ID");

    api.endGame(sId, detailsId, points)
      .then(res => {
        if (res && res.total_point !== undefined) {
          setPoints(res.total_point);
        }
      })
      .catch(err => console.warn("End game sync error:", err));
  }, [points]);

  // Handle Play Again
  const handlePlayAgain = useCallback(async () => {
    sound.playClick();
    setIsRestarting(true);

    try {
      await api.startGame();
      sound.playKey(5);
      navigate("/quiz");
    } catch (err) {
      console.error("Failed to restart:", err);
      setIsRestarting(false);
      navigate("/home");
    }
  }, [navigate]);

  // Keyboard shortcut Space / Enter to play again, Esc for lobby
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handlePlayAgain();
      } else if (e.key === 'Escape') {
        navigate('/home');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayAgain, navigate]);

  // Performance Rating calculation
  const getPerformanceGrade = () => {
    if (points >= 100) return { grade: "S", label: "LEGENDARY", color: "#ec4899" };
    if (points >= 60) return { grade: "A", label: "MASTERCLASS", color: "#38bdf8" };
    if (points >= 40) return { grade: "B", label: "EXCELLENT", color: "#10b981" };
    if (points >= 20) return { grade: "C", label: "SOLID RUN", color: "#f59e0b" };
    return { grade: "D", label: "WARMING UP", color: "#94a3b8" };
  };

  const performance = getPerformanceGrade();
  const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

  // Tier Progress Calculation
  const nextTierGoal = points < 100 ? 100 : points < 250 ? 250 : points < 500 ? 500 : 1000;
  const currentTierName = points >= 500 ? "Master" : points >= 250 ? "Platinum" : points >= 100 ? "Gold" : "Silver";
  const nextTierName = points >= 500 ? "Grandmaster" : points >= 250 ? "Master" : points >= 100 ? "Platinum" : "Gold";
  const tierProgressPercent = Math.min(100, Math.round((points / nextTierGoal) * 100));

  const handleShare = () => {
    sound.playClick();
    const shareText = `🎮 I just scored ${points} PTS with ${accuracy}% accuracy on Smiley Quest! Can you beat my high score? Play now!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="game-over-container">
      <Container className="py-5">
        <div className="game-over-card mx-auto">
          {/* Header Badge */}
          <div className="text-center mb-3">
            {isNewBest ? (
              <div className="new-high-score-banner">
                <Fire size={18} className="me-1 text-warning" />
                <span>NEW PERSONAL BEST!</span>
              </div>
            ) : (
              <div className="game-over-pill">
                <span>ROUND COMPLETED</span>
              </div>
            )}
            <h1 className="game-over-title mt-2">PERFORMANCE REPORT</h1>
          </div>

          {/* Central Grade & Points Display */}
          <div className="score-hero-box my-4">
            <div className="score-grade-badge" style={{ borderColor: performance.color }}>
              <span className="grade-letter" style={{ color: performance.color }}>
                {performance.grade}
              </span>
              <span className="grade-sub">{performance.label}</span>
            </div>

            <div className="total-points-display">
              <span className="pts-label">FINAL SCORE</span>
              <div className="pts-number">
                {points} <span className="pts-unit">PTS</span>
              </div>
            </div>
          </div>

          {/* Tier XP Progress Bar */}
          <div className="tier-xp-box mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-secondary">
                Tier Rank: <strong className="text-light">{currentTierName}</strong>
              </span>
              <span className="small text-info">
                Next: <strong>{nextTierName}</strong> ({points}/{nextTierGoal} pts)
              </span>
            </div>
            <ProgressBar
              now={tierProgressPercent}
              className="custom-xp-progress"
              style={{ height: '10px' }}
            />
          </div>

          {/* Detailed Statistics Grid */}
          <Row className="g-3 my-4 stats-grid">
            <Col xs={6} md={3}>
              <div className="stat-card">
                <CheckCircleFill size={20} color="#10b981" className="mb-1" />
                <div className="stat-val">{correctCount}</div>
                <div className="stat-label">Puzzles Solved</div>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div className="stat-card">
                <AwardFill size={20} color="#38bdf8" className="mb-1" />
                <div className="stat-val">{accuracy}%</div>
                <div className="stat-label">Accuracy</div>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div className="stat-card">
                <LightningChargeFill size={20} color="#f59e0b" className="mb-1" />
                <div className="stat-val">{maxStreak}x</div>
                <div className="stat-label">Max Streak</div>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div className="stat-card">
                <StarFill size={20} color="#ec4899" className="mb-1" />
                <div className="stat-val">+{points}</div>
                <div className="stat-label">XP Gained</div>
              </div>
            </Col>
          </Row>

          {/* Action Buttons */}
          <div className="d-flex flex-wrap gap-3 justify-content-center mt-4">
            <button
              className="btn-arcade-play px-5 py-3"
              onClick={handlePlayAgain}
              disabled={isRestarting}
            >
              {isRestarting ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Generating...
                </>
              ) : (
                <>
                  <ArrowRepeat size={22} className="me-2" />
                  PLAY AGAIN (Spacebar)
                </>
              )}
            </button>

            <button
              className="btn-arcade-outline px-4 py-3"
              onClick={() => { sound.playClick(); navigate('/point-table'); }}
            >
              <TrophyFill size={18} className="me-2 text-warning" />
              Leaderboard
            </button>

            <button
              className="btn-arcade-ghost px-4 py-3"
              onClick={() => { sound.playClick(); navigate('/home'); }}
            >
              <HouseDoorFill size={18} className="me-2 text-info" />
              Lobby
            </button>

            <button
              className="btn-arcade-ghost px-3 py-3"
              onClick={handleShare}
              title="Share Score"
            >
              <ShareFill size={16} className="me-1" />
              {copied ? "Copied!" : "Share"}
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
