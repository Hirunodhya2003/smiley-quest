// @ts-check
import axios from 'axios';

// Detect API base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Add auth header interceptor
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Login with username and password
  async login(username, password) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('grant_type', 'password');

    const res = await apiClient.post('/api/v1/oauth/token', formData, {
      headers: {
        Authorization: 'Basic cGxheWVyOg==',
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.data?.access_token) {
      localStorage.setItem('ACCESS_TOKEN', res.data.access_token);
      localStorage.setItem('User', JSON.stringify(res.data.user));
      window.dispatchEvent(new Event('auth-change'));
      return res.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  },

  // Signup
  async signup(userName, email, password) {
    const res = await apiClient.post('/api/v1/player/signup', {
      userName,
      email,
      password
    });
    return res.data;
  },

  // Set guest / quick player
  setGuestUser(nickname = 'Guest Explorer', avatar = '😎') {
    const guestUser = {
      userId: 9999,
      username: nickname,
      avatar: avatar,
      isGuest: true,
      userDetails: {
        userId: 9999,
        userName: nickname,
        email: `${nickname.toLowerCase().replace(/\s+/g, '')}@guest.local`,
        level: 50.0,
        level_eum: 'Silver'
      }
    };
    localStorage.setItem('ACCESS_TOKEN', 'GUEST_TOKEN_' + Date.now());
    localStorage.setItem('User', JSON.stringify(guestUser));
    window.dispatchEvent(new Event('auth-change'));
    return guestUser;
  },

  // Get current user
  getCurrentUser() {
    try {
      const stored = localStorage.getItem('User');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  },

  // Logout
  logout() {
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('User');
    sessionStorage.clear();
    window.dispatchEvent(new Event('auth-change'));
  },

  // Start new game
  async startGame() {
    const res = await apiClient.post('/api/v1/game/start');
    if (res.data?.success && res.data.body) {
      sessionStorage.setItem('SCORE_ID', String(res.data.body.score_id));
      sessionStorage.setItem('SCORE_DETAILS_ID', String(res.data.body.score_details_id));
      sessionStorage.setItem('URL', res.data.body.question);
      return res.data.body;
    }
    throw new Error('Failed to start game session');
  },

  // Check answer
  async checkAnswer(scoreId, scoreDetailsId, answer) {
    const res = await apiClient.post('/api/v1/game/answer/check', {
      score_id: scoreId,
      score_details_id: scoreDetailsId,
      answer: parseInt(answer, 10)
    });

    if (res.data?.success && res.data.body) {
      return res.data.body;
    }
    throw new Error('Failed to check answer');
  },

  // End game
  async endGame(scoreId, scoreDetailsId, points) {
    const res = await apiClient.post('/api/v1/game/end', {
      score_id: scoreId,
      score_details_id: scoreDetailsId,
      end_type: 'AUTO_END',
      points: points
    });

    if (res.data?.success && res.data.body) {
      return res.data.body;
    }
    return { score_id: scoreId, total_point: points };
  },

  // Get top scores
  async getTopScores() {
    const res = await apiClient.get('/api/v1/game/top-score');
    if (res.data?.success && Array.isArray(res.data.body)) {
      return res.data.body;
    }
    return [];
  }
};
