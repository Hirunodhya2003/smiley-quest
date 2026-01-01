import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Dropdown } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import {
  VolumeUpFill,
  VolumeMuteFill,
  TrophyFill,
  Controller,
  QuestionCircleFill,
  BoxArrowRight,
  PersonCircle,
  ShieldShaded
} from "react-bootstrap-icons";
import { sound } from "../utils/audio";
import { api } from "../utils/api";
import { HowToPlayModal } from "./HowToPlayModal";

export const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(api.getCurrentUser());
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [showGuide, setShowGuide] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(api.getCurrentUser());
    };
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  const handleLogout = () => {
    sound.playClick();
    api.logout();
    navigate('/auth');
  };

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'master': return '#ec4899';
      case 'diamond': return '#38bdf8';
      case 'platinum': return '#a855f7';
      case 'gold': return '#f59e0b';
      case 'silver': return '#94a3b8';
      default: return '#10b981';
    }
  };

  const isCurrentPath = (path) => location.pathname === path;

  return (
    <>
      <Navbar
        expand="lg"
        fixed="top"
        className={`custom-glass-navbar ${scrolled ? "scrolled" : ""}`}
      >
        <Container fluid="xl" className="px-3 px-md-4">
          {/* Brand Logo */}
          <Navbar.Brand
            onClick={() => { sound.playClick(); navigate('/home'); }}
            className="brand-container d-flex align-items-center gap-2"
            role="button"
          >
            <div className="brand-logo-glow">
              <span className="brand-emoji">😃</span>
            </div>
            <div>
              <div className="brand-title">SMILEY QUEST</div>
              <div className="brand-subtitle">MATH ARCADE</div>
            </div>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="game-nav-collapse" className="border-0 shadow-none">
            <span className="navbar-toggler-icon-custom"></span>
          </Navbar.Toggle>

          <Navbar.Collapse id="game-nav-collapse" className="mt-3 mt-lg-0">
            {/* Center Navigation Links */}
            <Nav className="mx-auto nav-links-group gap-1 gap-lg-2">
              <Nav.Link
                onClick={() => { sound.playClick(); navigate('/home'); }}
                className={`nav-pill-item ${isCurrentPath('/home') ? 'active' : ''}`}
              >
                <Controller size={18} className="me-2" />
                Play Arena
              </Nav.Link>

              <Nav.Link
                onClick={() => { sound.playClick(); navigate('/point-table'); }}
                className={`nav-pill-item ${isCurrentPath('/point-table') ? 'active' : ''}`}
              >
                <TrophyFill size={16} className="me-2 text-warning" />
                Leaderboard
              </Nav.Link>

              <Nav.Link
                onClick={() => { sound.playClick(); setShowGuide(true); }}
                className="nav-pill-item"
              >
                <QuestionCircleFill size={16} className="me-2 text-info" />
                How to Play
              </Nav.Link>
            </Nav>

            {/* Right Controls: Sound & Profile */}
            <div className="d-flex align-items-center gap-2 gap-md-3">
              {/* Sound Toggle */}
              <button
                className={`btn-sound-toggle ${isMuted ? 'muted' : 'active'}`}
                onClick={handleToggleSound}
                title={isMuted ? "Unmute Sound" : "Mute Sound"}
                aria-label="Sound Toggle"
              >
                {isMuted ? <VolumeMuteFill size={20} /> : <VolumeUpFill size={20} />}
                <span className="d-none d-sm-inline ms-1 sound-label">
                  {isMuted ? "Muted" : "Audio On"}
                </span>
              </button>

              {/* Player Profile or Login Button */}
              {user ? (
                <Dropdown align="end">
                  <Dropdown.Toggle as="div" className="player-badge-pill" role="button">
                    <span className="player-avatar-badge">
                      {user.avatar || '😎'}
                    </span>
                    <div className="d-flex flex-column text-start">
                      <span className="player-name-text">
                        {user.username || user.userDetails?.userName || "Player"}
                      </span>
                      <span
                        className="player-tier-sub"
                        style={{ color: getTierColor(user.userDetails?.level_eum) }}
                      >
                        <ShieldShaded size={11} className="me-1" />
                        {user.userDetails?.level_eum || "Silver"} • {user.userDetails?.level || 0} pts
                      </span>
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="glass-dropdown-menu">
                    <div className="px-3 py-2 border-bottom border-secondary border-opacity-25">
                      <small className="text-secondary d-block">Signed in as</small>
                      <strong className="text-light">{user.username || "Player"}</strong>
                    </div>

                    <Dropdown.Item onClick={() => { sound.playClick(); navigate('/home'); }}>
                      <Controller size={16} className="me-2 text-info" />
                      Game Lobby
                    </Dropdown.Item>

                    <Dropdown.Item onClick={() => { sound.playClick(); navigate('/point-table'); }}>
                      <TrophyFill size={16} className="me-2 text-warning" />
                      High Scores
                    </Dropdown.Item>

                    <Dropdown.Divider className="border-secondary border-opacity-25" />

                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      <BoxArrowRight size={16} className="me-2" />
                      Switch Account / Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <button
                  className="btn-arcade-gradient px-4 py-2"
                  onClick={() => { sound.playClick(); navigate('/auth'); }}
                >
                  <PersonCircle size={16} className="me-2" />
                  Sign In
                </button>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Guide Tutorial Modal */}
      <HowToPlayModal show={showGuide} onHide={() => setShowGuide(false)} />
    </>
  );
};
