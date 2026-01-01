import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import {
  PersonFill,
  LockFill,
  EnvelopeFill,
  EyeFill,
  EyeSlashFill,
  ArrowRightCircleFill,
  Controller,
  LightningFill,
  CheckCircleFill
} from "react-bootstrap-icons";
import { api } from "../../utils/api";
import { sound } from "../../utils/audio";

export default function Auth() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Signin form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Signup form state
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleLogin = async (e) => {
    e?.preventDefault();
    sound.playClick();
    setErrorMsg("");
    setSuccessMsg("");

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      await api.login(username.trim(), password.trim());
      sound.playCorrect();
      navigate('/home');
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMsg(err.message || "Invalid credentials. Try Quick Demo Login!");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e?.preventDefault();
    sound.playClick();
    setErrorMsg("");
    setSuccessMsg("");

    if (!newUsername.trim() || !newEmail.trim() || !newPassword.trim()) {
      setErrorMsg("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.signup(newUsername.trim(), newEmail.trim(), newPassword.trim());
      sound.playCorrect();
      setSuccessMsg(res.message || "Account registered successfully!");

      // Auto login
      setTimeout(async () => {
        try {
          await api.login(newUsername.trim(), newPassword.trim());
          navigate('/home');
        } catch (e) {
          setMode("signin");
          setUsername(newUsername);
        }
      }, 1000);
    } catch (err) {
      console.error("Signup failed:", err);
      setErrorMsg(err.message || "Registration failed. Try another username.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    sound.playClick();
    setUsername("player");
    setPassword("password123");
    setLoading(true);
    setErrorMsg("");

    try {
      await api.login("player", "password123");
      sound.playCorrect();
      navigate('/home');
    } catch (err) {
      setErrorMsg("Could not connect to local server. Ensure backend is running!");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestPlay = () => {
    sound.playClick();
    api.setGuestUser("Guest Racer", "😎");
    sound.playKey(5);
    navigate('/home');
  };

  return (
    <div className="auth-page-container">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={5}>
            <div className="auth-card-glass">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="auth-logo-badge">
                  <span className="brand-emoji">😃</span>
                </div>
                <h2 className="auth-title mt-2">SMILEY QUEST</h2>
                <p className="auth-subtitle">Math Logic Arcade Arena</p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="auth-mode-switch mb-4">
                <button
                  type="button"
                  className={`btn-mode-tab ${mode === 'signin' ? 'active' : ''}`}
                  onClick={() => { sound.playClick(); setMode('signin'); setErrorMsg(''); }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`btn-mode-tab ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => { sound.playClick(); setMode('signup'); setErrorMsg(''); }}
                >
                  Create Account
                </button>
              </div>

              {/* Error & Success Messages */}
              {errorMsg && (
                <Alert variant="danger" className="py-2 text-center small rounded-3">
                  {errorMsg}
                </Alert>
              )}

              {successMsg && (
                <Alert variant="success" className="py-2 text-center small rounded-3">
                  <CheckCircleFill className="me-2" />
                  {successMsg}
                </Alert>
              )}

              {/* Sign In Form */}
              {mode === 'signin' ? (
                <form onSubmit={handleLogin}>
                  <div className="form-group-custom mb-3">
                    <label>Username</label>
                    <div className="input-icon-wrapper">
                      <PersonFill className="input-icon" size={18} />
                      <input
                        type="text"
                        placeholder="Enter your username..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="form-group-custom mb-4">
                    <label>Password</label>
                    <div className="input-icon-wrapper">
                      <LockFill className="input-icon" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn-toggle-eye"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeSlashFill size={18} /> : <EyeFill size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-arcade-play w-100 py-3 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner size="sm" animation="border" className="me-2" />
                    ) : (
                      <ArrowRightCircleFill size={18} className="me-2" />
                    )}
                    SIGN IN
                  </button>
                </form>
              ) : (
                /* Sign Up Form */
                <form onSubmit={handleSignup}>
                  <div className="form-group-custom mb-3">
                    <label>Player Username</label>
                    <div className="input-icon-wrapper">
                      <PersonFill className="input-icon" size={18} />
                      <input
                        type="text"
                        placeholder="Choose a username..."
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group-custom mb-3">
                    <label>Email Address</label>
                    <div className="input-icon-wrapper">
                      <EnvelopeFill className="input-icon" size={18} />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group-custom mb-4">
                    <label>Password</label>
                    <div className="input-icon-wrapper">
                      <LockFill className="input-icon" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-arcade-play w-100 py-3 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner size="sm" animation="border" className="me-2" />
                    ) : (
                      <CheckCircleFill size={18} className="me-2" />
                    )}
                    CREATE ACCOUNT
                  </button>
                </form>
              )}

              {/* Quick Actions Separator */}
              <div className="auth-divider my-4">
                <span>OR JUMP RIGHT IN</span>
              </div>

              {/* 1-Click Action Buttons */}
              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className="btn-arcade-outline w-100 py-2"
                  onClick={handleQuickDemoLogin}
                  disabled={loading}
                >
                  <LightningFill size={16} className="me-2 text-warning" />
                  Quick Demo Login (Player)
                </button>

                <button
                  type="button"
                  className="btn-arcade-ghost w-100 py-2"
                  onClick={handleGuestPlay}
                >
                  <Controller size={16} className="me-2 text-info" />
                  Instant Guest Play (No Password)
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
