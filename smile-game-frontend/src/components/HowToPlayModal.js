import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { QuestionCircle, CheckCircleFill, LightningChargeFill } from 'react-bootstrap-icons';
import { sound } from '../utils/audio';

export const HowToPlayModal = ({ show, onHide }) => {
  return (
    <Modal
      show={show}
      onHide={() => { sound.playClick(); onHide(); }}
      centered
      size="lg"
      className="modern-game-modal"
    >
      <div className="glass-modal-content">
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="d-flex align-items-center gap-2">
            <span className="modal-icon-badge">
              <QuestionCircle size={22} color="#38bdf8" />
            </span>
            <span className="gradient-text-blue">How to Play Smiley Quest</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          <p className="lead-guide-text mb-4">
            Test your deductive reasoning and speed math! Each puzzle displays equations with mystery smiley faces. Your goal is to solve the final equation marked with <strong>?</strong>.
          </p>

          <div className="rule-cards-grid">
            <div className="rule-card">
              <div className="rule-step-number">1</div>
              <h5>Deduce the Smilies</h5>
              <p>Look at the top 3 rows. Each distinct smiley has a fixed hidden integer value (1, 2, 3, etc.).</p>
              <div className="mini-example-box">
                <span className="demo-emoji">😀</span> + <span className="demo-emoji">😀</span> + <span className="demo-emoji">😀</span> = <strong>9</strong>
                <div className="solution-hint">➜ 😀 = 3</div>
              </div>
            </div>

            <div className="rule-card">
              <div className="rule-step-number">2</div>
              <h5>Watch Operators & Precedence</h5>
              <p>Observe the signs carefully: Addition (+), Subtraction (−), and Multiplication (×).</p>
              <div className="mini-example-box">
                <span className="demo-emoji">😀</span> + <span className="demo-emoji">😎</span> × <span className="demo-emoji">😎</span> = <strong>?</strong>
                <div className="solution-hint">Remember Order of Operations!</div>
              </div>
            </div>

            <div className="rule-card">
              <div className="rule-step-number">3</div>
              <h5>Enter Solution (0 - 9)</h5>
              <p>The answer is ALWAYS a single digit from <strong>0 to 9</strong>! Tap the keypad or use your physical keyboard keys.</p>
              <div className="mini-example-box text-center">
                <span className="keypad-badge">0</span> ... <span className="keypad-badge">9</span>
                <div className="solution-hint mt-1">Instant Keypad or Keyboard (0-9)</div>
              </div>
            </div>
          </div>

          <div className="combo-tip-box mt-4">
            <LightningChargeFill size={20} color="#f59e0b" className="flex-shrink-0" />
            <div>
              <strong>Streak Multipliers & Fast Answers:</strong> Consecutive correct answers award streak combo bonuses (+10, +15, +20)! Maintain your focus before the 60-second timer runs out.
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button
            className="btn-arcade-cyan w-100 py-3"
            onClick={() => { sound.playClick(); onHide(); }}
          >
            <CheckCircleFill size={18} className="me-2" />
            Got it, Let's Play!
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};
