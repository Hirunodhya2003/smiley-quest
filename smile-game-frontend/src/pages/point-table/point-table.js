import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Table, Spinner, Badge } from "react-bootstrap";
import {
  TrophyFill,
  ArrowLeftCircleFill,
  Controller,
  Search,
  ShieldFillCheck,
  Calendar3
} from "react-bootstrap-icons";
import { api } from "../../utils/api";
import { sound } from "../../utils/audio";

export default function PointTable() {
  const navigate = useNavigate();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser] = useState(() => api.getCurrentUser());

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const data = await api.getTopScores();
      setLeaderboard(data);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier) => {
    const t = tier || "Silver";
    return (
      <span className={`rank-badge-pill rank-${t.toLowerCase()}`}>
        <ShieldFillCheck size={12} className="me-1" />
        {t}
      </span>
    );
  };

  const filteredScores = leaderboard.filter(item =>
    (item.userName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  return (
    <div className="leaderboard-page-container">
      <Container className="py-4">
        {/* Header Bar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn-quiz-icon"
              onClick={() => { sound.playClick(); navigate('/home'); }}
              title="Back to Lobby"
            >
              <ArrowLeftCircleFill size={26} />
              <span className="d-none d-sm-inline ms-2">Lobby</span>
            </button>
            <div>
              <h2 className="leaderboard-heading mb-0">HALL OF FAME</h2>
              <small className="text-secondary">Global Top Smiley Quest Champions</small>
            </div>
          </div>

          <button
            className="btn-arcade-play px-4 py-2"
            onClick={() => { sound.playClick(); navigate('/home'); }}
          >
            <Controller size={20} className="me-2" />
            Play Arena
          </button>
        </div>

        {/* Top 3 Podium Showcase */}
        {leaderboard.length >= 3 && (
          <div className="podium-row mb-5">
            {/* 2nd Place */}
            {top2 && (
              <div className="podium-card podium-silver">
                <div className="podium-medal">🥈</div>
                <div className="podium-avatar">😎</div>
                <div className="podium-username">{top2.userName}</div>
                {getTierBadge(top2.level_eum)}
                <div className="podium-pts">{top2.point} <small>PTS</small></div>
                <div className="podium-pedestal rank-2">2nd PLACE</div>
              </div>
            )}

            {/* 1st Place */}
            {top1 && (
              <div className="podium-card podium-gold">
                <div className="crown-badge">👑</div>
                <div className="podium-medal">🥇</div>
                <div className="podium-avatar">🦁</div>
                <div className="podium-username">{top1.userName}</div>
                {getTierBadge(top1.level_eum || "Master")}
                <div className="podium-pts">{top1.point} <small>PTS</small></div>
                <div className="podium-pedestal rank-1">CHAMPION</div>
              </div>
            )}

            {/* 3rd Place */}
            {top3 && (
              <div className="podium-card podium-bronze">
                <div className="podium-medal">🥉</div>
                <div className="podium-avatar">🤠</div>
                <div className="podium-username">{top3.userName}</div>
                {getTierBadge(top3.level_eum)}
                <div className="podium-pts">{top3.point} <small>PTS</small></div>
                <div className="podium-pedestal rank-3">3rd PLACE</div>
              </div>
            )}
          </div>
        )}

        {/* Search & Full Leaderboard Table Card */}
        <div className="glass-table-wrapper">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 border-bottom border-secondary border-opacity-25">
            <h5 className="mb-0 text-light fw-bold d-flex align-items-center gap-2">
              <TrophyFill color="#f59e0b" />
              <span>Full Rankings</span>
              <Badge bg="secondary" className="ms-2">{leaderboard.length}</Badge>
            </h5>

            {/* Search Box */}
            <div className="search-box-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search player name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="info" />
              <div className="mt-2 text-secondary">Loading player rankings...</div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="modern-glass-table mb-0 align-middle">
                <thead>
                  <tr>
                    <th className="text-center" style={{ width: '80px' }}>Rank</th>
                    <th>Player</th>
                    <th>Tier Rank</th>
                    <th className="text-end">Points</th>
                    <th className="text-end d-none d-md-table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScores.length > 0 ? (
                    filteredScores.map((item, idx) => {
                      const isMe = currentUser?.username &&
                        currentUser.username.toLowerCase() === (item.userName || '').toLowerCase();

                      return (
                        <tr key={item.id || idx} className={isMe ? 'my-rank-row' : ''}>
                          <td className="text-center">
                            <span className={`rank-number-pill rank-pos-${idx + 1}`}>
                              {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                            </span>
                          </td>

                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span className="table-avatar">
                                {idx === 0 ? "🦁" : idx === 1 ? "😎" : idx === 2 ? "🤠" : "👾"}
                              </span>
                              <div>
                                <span className="player-table-name">{item.userName}</span>
                                {isMe && <Badge bg="info" className="ms-2">YOU</Badge>}
                              </div>
                            </div>
                          </td>

                          <td>
                            {getTierBadge(item.level_eum)}
                          </td>

                          <td className="text-end">
                            <span className="table-points-val">
                              {item.point} <small className="text-secondary">pts</small>
                            </span>
                          </td>

                          <td className="text-end text-secondary small d-none d-md-table-cell">
                            <Calendar3 size={12} className="me-1" />
                            {item.date ? item.date.split('T')[0] : 'Today'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-secondary">
                        No players matching "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
