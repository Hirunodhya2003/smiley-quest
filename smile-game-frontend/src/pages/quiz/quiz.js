import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import {
  ArrowLeftCircleFill,
  ClockFill,
  StarFill,
  LightningFill,
  CheckCircleFill,
  XCircleFill,
  VolumeUpFill,
  VolumeMuteFill,
  ArrowRightCircleFill,
  ArrowCounterclockwise,
  Snow2,
  Bullseye
} from "react-bootstrap-icons";
import { api } from "../../utils/api";
import { sound } from "../../utils/audio";
import { fireConfetti } from "../../utils/confetti";

export default function Quiz() {
  const navigate = useNavigate();

  // Game state
  const [scoreId, setScoreId] = useState(() => sessionStorage.getItem('SCORE_ID') || '');
  const [scoreDetailsId, setScoreDetailsId] = useState(() => sessionStorage.getItem('SCORE_DETAILS_ID') || '');
  const [url, setUrl] = useState(() => sessionStorage.getItem('URL') || '');
  
  const [points, setPoints] = useState(0);
  const [time, setTime] = useState(60); // 60 seconds
  const [selectedDigit, setSelectedDigit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Power-ups state
  const [usedFreeze, setUsedFreeze] = useState(false);
  const [usedFifty, setUsedFifty] = useState(false);
  const [disabledDigits, setDisabledDigits] = useState([]);

  // Performance stats
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [questionCount, setQuestionCount] = useState(1);

  // Feedback banner state
  const [feedback, setFeedback] = useState(null);
  const [isMuted, setIsMuted] = useState(sound.isMuted());

  // Float points animation state
  const [floatPoints, setFloatPoints] = useState(null);

  // Sound toggle
  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (time <= 0) {
      sound.playGameOver();
      sessionStorage.setItem('POINTS', String(points));
      sessionStorage.setItem('SCORE_ID', String(scoreId));
      sessionStorage.setItem('SCORE_DETAILS_ID', String(scoreDetailsId));
      sessionStorage.setItem('CORRECT_COUNT', String(correctAnswers));
      sessionStorage.setItem('TOTAL_ATTEMPTS', String(totalAttempts));
      sessionStorage.setItem('MAX_STREAK', String(maxStreak));
      navigate('/end');
      return;
    }

    if (time <= 10) {
      sound.playUrgentTick();
    } else if (time % 5 === 0) {
      sound.playTick();
    }

    const timer = setInterval(() => {
      setTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [time, points, scoreId, scoreDetailsId, correctAnswers, totalAttempts, maxStreak, navigate]);

  // Answer Submission Logic
  const handleSubmitAnswer = useCallback(async (digitToSubmit) => {
    const answerDigit = digitToSubmit !== undefined ? digitToSubmit : selectedDigit;
    if (answerDigit === null || answerDigit === undefined || isSubmitting) return;

    setIsSubmitting(true);
    setTotalAttempts(prev => prev + 1);

    try {
      const result = await api.checkAnswer(scoreId, scoreDetailsId, answerDigit);

      if (result.is_true) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setMaxStreak(prev => Math.max(prev, newStreak));
        setCorrectAnswers(prev => prev + 1);

        sound.playCorrect(newStreak);
        if (newStreak % 3 === 0 || newStreak >= 5) {
          fireConfetti(50);
        }

        const bonus = newStreak > 1 ? Math.min(newStreak * 2, 10) : 0;
        const ptsGained = 10 + bonus;
        setPoints(result.point || (points + ptsGained));

        setFloatPoints(`+${ptsGained} PTS!`);
        setTimeout(() => setFloatPoints(null), 1200);

        setFeedback({
          type: 'correct',
          msg: newStreak > 1 ? `CORRECT! 🔥 ${newStreak}x STREAK BONUS!` : 'EXCELLENT! +10 POINTS'
        });
      } else {
        setStreak(0);
        sound.playWrong();
        setFeedback({
          type: 'wrong',
          msg: 'WRONG ANSWER! Keep pushing!'
        });
      }

      // Update question details for next round & clear disabled digits
      setScoreId(result.score_id);
      setScoreDetailsId(result.score_details_id);
      setUrl(result.question);
      setQuestionCount(prev => prev + 1);
      setSelectedDigit(null);
      setDisabledDigits([]);
      setImageLoading(true);

      setTimeout(() => {
        setFeedback(null);
      }, 1500);

    } catch (err) {
      console.error("Answer submission failed:", err);
      setFeedback({ type: 'wrong', msg: 'Network error. Try again!' });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedDigit, isSubmitting, scoreId, scoreDetailsId, streak, points]);

  // Handle digit button click
  const handleDigitClick = useCallback((num) => {
    if (disabledDigits.includes(num)) return;
    sound.playKey(num);
    setSelectedDigit(num);
    handleSubmitAnswer(num);
  }, [disabledDigits, handleSubmitAnswer]);

  // Power-up Handlers
  const handleFreezeTime = () => {
    if (usedFreeze || isSubmitting) return;
    sound.playPowerup();
    setTime(prev => prev + 10);
    setUsedFreeze(true);
    setFeedback({ type: 'correct', msg: '❄️ +10s TIME EXTENDED!' });
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleFiftyFifty = () => {
    if (usedFifty || isSubmitting) return;
    sound.playPowerup();
    setUsedFifty(true);
    // Disable 4 digits randomly
    const digitsToDisable = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => 0.5 - Math.random()).slice(0, 4);
    setDisabledDigits(digitsToDisable);
    setFeedback({ type: 'correct', msg: '🎯 50/50: 4 wrong choices eliminated!' });
    setTimeout(() => setFeedback(null), 1500);
  };

  // Keyboard Event Listener for Keys 0-9
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isSubmitting) return;

      if (e.key >= '0' && e.key <= '9') {
        const num = parseInt(e.key, 10);
        handleDigitClick(num);
      } else if (e.key === 'Backspace' || e.key === 'Escape') {
        setSelectedDigit(null);
      } else if (e.key === 'Enter' && selectedDigit !== null) {
        handleSubmitAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDigit, isSubmitting, handleSubmitAnswer, handleDigitClick]);

  // Time format helper
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getTimerClass = () => {
    if (time <= 10) return 'timer-critical';
    if (time <= 25) return 'timer-warning';
    return 'timer-normal';
  };

  return (
    <div className="quiz-page-container">
      <Container className="py-3">
        {/* Top Control Bar */}
        <div className="d-flex align-items-center justify-content-between mb-3 quiz-header-bar">
          <button
            className="btn-quiz-icon"
            onClick={() => {
              if (window.confirm("Quit game? Your current score will be recorded.")) {
                sound.playClick();
                navigate('/home');
              }
            }}
            title="Quit Game"
          >
            <ArrowLeftCircleFill size={26} />
            <span className="d-none d-sm-inline ms-2">Exit</span>
          </button>

          <div className="d-flex align-items-center gap-2">
            <span className="round-pill">
              Round #{questionCount}
            </span>

            {streak >= 2 && (
              <span className="streak-badge-pill">
                <LightningFill size={15} color="#f59e0b" />
                {streak}x Combo!
              </span>
            )}
          </div>

          <button
            className="btn-quiz-icon"
            onClick={toggleSound}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeMuteFill size={24} /> : <VolumeUpFill size={24} />}
          </button>
        </div>

        {/* Floating Points Notification */}
        {floatPoints && (
          <div className="float-points-popup">
            {floatPoints}
          </div>
        )}

        {/* HUD Score & Timer Bar */}
        <div className="quiz-hud-grid mb-3">
          <div className={`quiz-hud-card ${getTimerClass()}`}>
            <ClockFill size={22} className="timer-icon" />
            <div>
              <div className="hud-label">TIME REMAINING</div>
              <div className="hud-value timer-digits">{formatTime(time)}</div>
            </div>
          </div>

          <div className="quiz-hud-card hud-points-card">
            <StarFill size={22} color="#f59e0b" />
            <div>
              <div className="hud-label">TOTAL SCORE</div>
              <div className="hud-value points-digits">{points} <small>pts</small></div>
            </div>
          </div>

          <div className="quiz-hud-card d-none d-md-flex">
            <CheckCircleFill size={22} color="#10b981" />
            <div>
              <div className="hud-label">ACCURACY</div>
              <div className="hud-value">
                {totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 100}%
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div className={`feedback-hud-banner banner-${feedback.type}`}>
            {feedback.type === 'correct' ? (
              <CheckCircleFill size={22} className="me-2" />
            ) : (
              <XCircleFill size={22} className="me-2" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Main Puzzle & Keypad Section */}
        <Row className="g-4 align-items-center">
          {/* Left: Puzzle Image Box */}
          <Col lg={7}>
            <div className="puzzle-image-wrapper">
              {imageLoading && (
                <div className="image-loading-overlay">
                  <Spinner animation="border" variant="info" />
                  <span className="mt-2 text-info small">Loading math puzzle...</span>
                </div>
              )}

              <img
                src={url || "https://marcconrad.com/uob/smile/api.php?out=json&base64=no"}
                alt="Smiley Math Logic Puzzle"
                className={`puzzle-main-img ${imageLoading ? 'loading' : 'loaded'}`}
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                  setImageLoading(false);
                  e.currentTarget.src = `http://localhost:5001/api/v1/puzzle/image/fallback_${Date.now()}.svg`;
                }}
              />

              <div className="puzzle-caption-tag">
                <span>Solve for the <strong>?</strong> (Single digit 0-9)</span>
              </div>
            </div>
          </Col>

          {/* Right: Keypad & Power-ups */}
          <Col lg={5}>
            <div className="quiz-keypad-panel">
              {/* Power-ups Row */}
              <div className="powerup-row mb-3">
                <button
                  type="button"
                  className={`btn-powerup ${usedFreeze ? 'used' : ''}`}
                  onClick={handleFreezeTime}
                  disabled={usedFreeze || isSubmitting}
                  title="Adds +10 seconds once per match"
                >
                  <Snow2 size={16} className="me-1" />
                  <span>+10s Freeze</span>
                </button>

                <button
                  type="button"
                  className={`btn-powerup ${usedFifty ? 'used' : ''}`}
                  onClick={handleFiftyFifty}
                  disabled={usedFifty || isSubmitting}
                  title="Eliminates 4 wrong choices once per match"
                >
                  <Bullseye size={16} className="me-1" />
                  <span>50/50 Clue</span>
                </button>
              </div>

              <div className="keypad-header mb-3">
                <span className="keypad-title">NUMERIC KEYPAD</span>
                <span className="keypad-tip">Press 0-9 on keyboard</span>
              </div>

              {/* 3x3 Keypad Grid */}
              <div className="keypad-grid mb-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                  const isDisabled = disabledDigits.includes(num);
                  return (
                    <button
                      key={num}
                      type="button"
                      className={`btn-keypad-digit ${selectedDigit === num ? 'active' : ''} ${isDisabled ? 'disabled-digit' : ''}`}
                      onClick={() => handleDigitClick(num)}
                      disabled={isSubmitting || isDisabled}
                    >
                      {isDisabled ? '—' : num}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Row: Clear, 0, Submit */}
              <div className="keypad-bottom-row">
                <button
                  type="button"
                  className="btn-keypad-action btn-clear"
                  onClick={() => { sound.playClick(); setSelectedDigit(null); }}
                  disabled={isSubmitting}
                  title="Clear (Esc)"
                >
                  <ArrowCounterclockwise size={20} />
                  <span>CLR</span>
                </button>

                <button
                  type="button"
                  className={`btn-keypad-digit digit-zero ${selectedDigit === 0 ? 'active' : ''} ${disabledDigits.includes(0) ? 'disabled-digit' : ''}`}
                  onClick={() => handleDigitClick(0)}
                  disabled={isSubmitting || disabledDigits.includes(0)}
                >
                  {disabledDigits.includes(0) ? '—' : 0}
                </button>

                <button
                  type="button"
                  className="btn-keypad-action btn-submit"
                  onClick={() => handleSubmitAnswer()}
                  disabled={isSubmitting || selectedDigit === null}
                  title="Submit Answer"
                >
                  {isSubmitting ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <>
                      <ArrowRightCircleFill size={20} />
                      <span>ENTER</span>
                    </>
                  )}
                </button>
              </div>

              {/* Skip Option */}
              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-link text-secondary text-decoration-none small"
                  onClick={() => {
                    sound.playKey(0);
                    handleSubmitAnswer(99);
                  }}
                  disabled={isSubmitting}
                >
                  Skip this puzzle ➔
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
