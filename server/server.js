// @ts-check
/**
 * Smiley Quest - Local High-Performance Game Backend
 * Native Node.js Server (Zero Dependencies, Zero Configuration)
 * Fully compatible with the Smiley Game Spring Boot API contract.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = parseInt(process.env.PORT || '5001', 10);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default database structure
const DEFAULT_DB = {
  users: [
    {
      id: 1,
      userName: "player",
      password: "password123",
      email: "player@smileyquest.com",
      status: "ACTIVE",
      email_verified: "VERIFY",
      level: 120.0,
      level_eum: "Gold",
      created: new Date().toISOString()
    },
    {
      id: 2,
      userName: "admin",
      password: "admin123",
      email: "admin@smileyquest.com",
      status: "ACTIVE",
      email_verified: "VERIFY",
      level: 500.0,
      level_eum: "Platinum",
      created: new Date().toISOString()
    },
    {
      id: 3,
      userName: "Nipuni",
      password: "nipuni",
      email: "nipuni@smileyquest.com",
      status: "ACTIVE",
      email_verified: "VERIFY",
      level: 80.0,
      level_eum: "Silver",
      created: new Date().toISOString()
    }
  ],
  topScores: [
    { id: 1, userName: "NovaChampion", point: 280.0, date: new Date(Date.now() - 3600000 * 2).toISOString(), level_eum: "Master" },
    { id: 2, userName: "PixelMaster", point: 220.0, date: new Date(Date.now() - 3600000 * 6).toISOString(), level_eum: "Platinum" },
    { id: 3, userName: "SmileyNinja", point: 180.0, date: new Date(Date.now() - 3600000 * 12).toISOString(), level_eum: "Gold" },
    { id: 4, userName: "ByteRacer", point: 140.0, date: new Date(Date.now() - 3600000 * 24).toISOString(), level_eum: "Gold" },
    { id: 5, userName: "Nipuni", point: 110.0, date: new Date(Date.now() - 3600000 * 36).toISOString(), level_eum: "Silver" },
    { id: 6, userName: "player", point: 90.0, date: new Date(Date.now() - 3600000 * 48).toISOString(), level_eum: "Silver" }
  ],
  activeGames: {}
};

// In-memory active database
let db = DEFAULT_DB;

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(data);
      if (!db.activeGames) db.activeGames = {};
      if (!db.topScores) db.topScores = DEFAULT_DB.topScores;
      if (!db.users) db.users = DEFAULT_DB.users;
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.warn("Could not load db.json, using defaults:", err.message);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to save db.json:", err.message);
  }
}

loadDatabase();

// In-memory cache for dynamic puzzles
const puzzleCache = new Map();

/**
 * Generate a dynamic SVG smiley math puzzle
 * Guarantees a clean, solvable single-digit solution (0 - 9)
 */
function generateLocalPuzzle(id) {
  const smilies = [
    { name: "classic", bg: "#facc15", eyes: "#1e293b", mouth: "#1e293b", extra: "happy" },
    { name: "cool", bg: "#38bdf8", eyes: "#0f172a", mouth: "#0f172a", extra: "glasses" },
    { name: "star", bg: "#ec4899", eyes: "#831843", mouth: "#831843", extra: "star" },
    { name: "angel", bg: "#a855f7", eyes: "#3b0764", mouth: "#3b0764", extra: "halo" },
    { name: "wink", bg: "#34d399", eyes: "#064e3b", mouth: "#064e3b", extra: "wink" }
  ];

  // Pick 3 random distinct smilies
  const shuffled = [...smilies].sort(() => 0.5 - Math.random());
  const sA = shuffled[0];
  const sB = shuffled[1];
  const sC = shuffled[2];

  // Pick positive integer values for sA, sB, sC
  // Ensure the final equation results in a single digit 0-9
  const valA = Math.floor(Math.random() * 4) + 1; // 1 to 4
  const valB = Math.floor(Math.random() * 3) + 1; // 1 to 3
  
  // Choose puzzle formula type
  // Type 1: sA + sB + sC = ?
  // Type 2: sA * sB - sC = ?
  // Type 3: sA + sB * sC = ?
  const puzzleType = Math.floor(Math.random() * 3);
  let valC = 1;
  let finalAnswer = 0;
  let op1 = "+";
  let op2 = "+";

  if (puzzleType === 0) {
    // valA + valB + valC
    valC = Math.max(1, Math.min(9 - valA - valB, Math.floor(Math.random() * 4) + 1));
    finalAnswer = valA + valB + valC;
    op1 = "+";
    op2 = "+";
  } else if (puzzleType === 1) {
    // valA * valB - valC
    const prod = valA * valB;
    valC = Math.max(0, prod - (Math.floor(Math.random() * 5) + 1));
    finalAnswer = prod - valC;
    op1 = "×";
    op2 = "−";
  } else {
    // valA + valB - valC
    valC = Math.floor(Math.random() * Math.min(valA + valB, 3));
    finalAnswer = (valA + valB) - valC;
    op1 = "+";
    op2 = "−";
  }

  // Ensure answer is between 0 and 9
  finalAnswer = Math.max(0, Math.min(9, Math.round(finalAnswer)));

  // Row 1: sA + sA + sA = (3 * valA)
  const row1Total = valA + valA + valA;
  // Row 2: sA + sB + sB = (valA + 2 * valB)
  const row2Total = valA + valB + valB;
  // Row 3: sB + sC + sC = (valB + 2 * valC)
  const row3Total = valB + valC + valC;

  function renderSmiley(s, x, y, size = 46) {
    const r = size / 2;
    let extraSvg = "";
    if (s.extra === "glasses") {
      extraSvg = `
        <rect x="${x - r + 8}" y="${y - 4}" width="${r - 2}" height="10" rx="3" fill="#0f172a" />
        <rect x="${x + 4}" y="${y - 4}" width="${r - 2}" height="10" rx="3" fill="#0f172a" />
        <line x1="${x - 2}" y1="${y}" x2="${x + 4}" y2="${y}" stroke="#0f172a" stroke-width="3" />
      `;
    } else if (s.extra === "star") {
      extraSvg = `
        <polygon points="${x - 10},${y - 8} ${x - 7},${y - 2} ${x - 1},${y - 2} ${x - 6},${y + 2} ${x - 4},${y + 8} ${x - 10},${y + 4} ${x - 16},${y + 8} ${x - 14},${y + 2} ${x - 19},${y - 2} ${x - 13},${y - 2}" fill="#fef08a" />
        <polygon points="${x + 10},${y - 8} ${x + 13},${y - 2} ${x + 19},${y - 2} ${x + 14},${y + 2} ${x + 16},${y + 8} ${x + 10},${y + 4} ${x + 4},${y + 8} ${x + 6},${y + 2} ${x + 1},${y - 2} ${x + 7},${y - 2}" fill="#fef08a" />
      `;
    } else if (s.extra === "halo") {
      extraSvg = `
        <ellipse cx="${x}" cy="${y - r - 4}" rx="${r - 4}" ry="4" fill="none" stroke="#fef08a" stroke-width="3" />
      `;
    } else if (s.extra === "wink") {
      extraSvg = `
        <circle cx="${x - 8}" cy="${y - 5}" r="3.5" fill="${s.eyes}" />
        <path d="M ${x + 4} ${y - 3} Q ${x + 9} ${y - 8} ${x + 14} ${y - 3}" stroke="${s.eyes}" stroke-width="3" fill="none" stroke-linecap="round" />
      `;
    } else {
      extraSvg = `
        <circle cx="${x - 8}" cy="${y - 5}" r="4" fill="${s.eyes}" />
        <circle cx="${x + 8}" cy="${y - 5}" r="4" fill="${s.eyes}" />
      `;
    }

    return `
      <g filter="url(#shadow)">
        <circle cx="${x}" cy="${y}" r="${r}" fill="${s.bg}" stroke="#ffffff" stroke-width="2.5" />
        ${extraSvg}
        <path d="M ${x - 10} ${y + 6} Q ${x} ${y + 16} ${x + 10} ${y + 6}" stroke="${s.mouth}" stroke-width="3.5" fill="none" stroke-linecap="round" />
      </g>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 440" width="100%" height="100%" style="border-radius: 18px; font-family: system-ui, -apple-system, sans-serif;">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="50%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#090d16" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.45" />
        </filter>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Background Card -->
      <rect x="0" y="0" width="680" height="440" rx="20" fill="url(#bgGrad)" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.3" />

      <!-- Decorative ambient glows -->
      <circle cx="80" cy="80" r="120" fill="#38bdf8" opacity="0.08" filter="url(#glow)" />
      <circle cx="600" cy="360" r="140" fill="#ec4899" opacity="0.08" filter="url(#glow)" />

      <!-- Title / Header Ribbon -->
      <rect x="180" y="16" width="320" height="38" rx="19" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
      <text x="340" y="41" font-size="16" font-weight="800" fill="#38bdf8" letter-spacing="3" text-anchor="middle">SMILEY LOGIC PUZZLE</text>

      <!-- Grid Rows -->
      <!-- Row 1 -->
      <g transform="translate(40, 75)">
        <rect x="0" y="0" width="600" height="70" rx="14" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.2" />
        ${renderSmiley(sA, 70, 35)}
        <text x="145" y="44" font-size="30" font-weight="bold" fill="#94a3b8" text-anchor="middle">+</text>
        ${renderSmiley(sA, 220, 35)}
        <text x="295" y="44" font-size="30" font-weight="bold" fill="#94a3b8" text-anchor="middle">+</text>
        ${renderSmiley(sA, 370, 35)}
        <text x="445" y="44" font-size="30" font-weight="bold" fill="#38bdf8" text-anchor="middle">=</text>
        <text x="525" y="46" font-size="32" font-weight="900" fill="#f8fafc" text-anchor="middle">${row1Total}</text>
      </g>

      <!-- Row 2 -->
      <g transform="translate(40, 155)">
        <rect x="0" y="0" width="600" height="70" rx="14" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.2" />
        ${renderSmiley(sA, 70, 35)}
        <text x="145" y="44" font-size="30" font-weight="bold" fill="#94a3b8" text-anchor="middle">+</text>
        ${renderSmiley(sB, 220, 35)}
        <text x="295" y="44" font-size="30" font-weight="bold" fill="#94a3b8" text-anchor="middle">+</text>
        ${renderSmiley(sB, 370, 35)}
        <text x="445" y="44" font-size="30" font-weight="bold" fill="#38bdf8" text-anchor="middle">=</text>
        <text x="525" y="46" font-size="32" font-weight="900" fill="#f8fafc" text-anchor="middle">${row2Total}</text>
      </g>

      <!-- Row 3 -->
      <g transform="translate(40, 235)">
        <rect x="0" y="0" width="600" height="70" rx="14" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.2" />
        ${renderSmiley(sB, 70, 35)}
        <text x="145" y="44" font-size="30" font-weight="bold" fill="#94a3b8" text-anchor="middle">+</text>
        ${renderSmiley(sC, 220, 35)}
        <text x="295" y="44" font-size="30" font-weight="bold" fill="#94a3b8" text-anchor="middle">+</text>
        ${renderSmiley(sC, 370, 35)}
        <text x="445" y="44" font-size="30" font-weight="bold" fill="#38bdf8" text-anchor="middle">=</text>
        <text x="525" y="46" font-size="32" font-weight="900" fill="#f8fafc" text-anchor="middle">${row3Total}</text>
      </g>

      <!-- Row 4 - QUESTION ROW -->
      <g transform="translate(40, 320)">
        <rect x="0" y="0" width="600" height="85" rx="16" fill="#1e1b4b" stroke="#818cf8" stroke-width="2.5" filter="url(#shadow)" />
        ${renderSmiley(sA, 70, 42, 54)}
        <text x="145" y="52" font-size="34" font-weight="bold" fill="#a5b4fc" text-anchor="middle">${op1}</text>
        ${renderSmiley(sB, 220, 42, 54)}
        <text x="295" y="52" font-size="34" font-weight="bold" fill="#a5b4fc" text-anchor="middle">${op2}</text>
        ${renderSmiley(sC, 370, 42, 54)}
        <text x="445" y="52" font-size="36" font-weight="bold" fill="#38bdf8" text-anchor="middle">=</text>
        
        <!-- Question Mark Badge -->
        <g transform="translate(485, 12)">
          <rect x="0" y="0" width="80" height="60" rx="12" fill="#ec4899" filter="url(#shadow)" />
          <text x="40" y="44" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle">?</text>
        </g>
      </g>
    </svg>
  `.trim();

  puzzleCache.set(String(id), { svg, solution: finalAnswer });
  return { svg, solution: finalAnswer };
}

/**
 * Fetch a question from Marc Conrad's Smiley API, or fall back to local SVG generator
 */
async function getQuestion() {
  const puzzleId = Date.now() + "_" + Math.floor(Math.random() * 10000);

  // Try external Marc Conrad API with a short 2.5s timeout
  try {
    const questionPromise = new Promise((resolve, reject) => {
      const req = https.get('https://marcconrad.com/uob/smile/api.php?out=json&base64=no', { timeout: 2500 }, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Status ${res.statusCode}`));
        }
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed && parsed.question && typeof parsed.solution !== 'undefined') {
              resolve(parsed);
            } else {
              reject(new Error("Invalid JSON format from API"));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error("Timeout reaching Marc Conrad API"));
      });
    });

    const result = await questionPromise;
    return {
      question: result.question,
      solution: parseInt(result.solution, 10),
      isFallback: false
    };
  } catch (err) {
    // Graceful offline fallback
    const local = generateLocalPuzzle(puzzleId);
    return {
      question: `http://localhost:${PORT}/api/v1/puzzle/image/${puzzleId}.svg`,
      solution: local.solution,
      isFallback: true
    };
  }
}

/**
 * Generate a JWT-like bearer token
 */
function createToken(userId, userName) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: String(userId),
    user_name: userName,
    exp: Math.floor(Date.now() / 1000) + 86400,
    authorities: ["ROLE_PLAYER"]
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', 'SMILEY_SECRET_KEY_12345').update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function verifyToken(authHeader) {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return payload;
  } catch (e) {
    return null;
  }
}

// Request Body Parser Helper
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      if (!body) return resolve({});
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        try {
          return resolve(JSON.parse(body));
        } catch (e) {
          return resolve({});
        }
      }
      if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        // Quick parse for form data or multipart form fields
        const result = {};
        if (contentType.includes('multipart/form-data')) {
          const matchUsername = body.match(/name="username"\r?\n\r?\n([^\r\n]+)/);
          const matchPassword = body.match(/name="password"\r?\n\r?\n([^\r\n]+)/);
          const matchGrant = body.match(/name="grant_type"\r?\n\r?\n([^\r\n]+)/);
          if (matchUsername) result.username = matchUsername[1].trim();
          if (matchPassword) result.password = matchPassword[1].trim();
          if (matchGrant) result.grant_type = matchGrant[1].trim();
          return resolve(result);
        } else {
          const params = new URLSearchParams(body);
          for (const [key, val] of params.entries()) {
            result[key] = val;
          }
          return resolve(result);
        }
      }
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, appversion'
  });
  res.end(JSON.stringify(data));
}

// Create Main Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || '/';
  const method = req.method || 'GET';

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, appversion',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  // 1. Serving Dynamic Local SVG Puzzle Images
  if (pathname.startsWith('/api/v1/puzzle/image/')) {
    const filename = pathname.replace('/api/v1/puzzle/image/', '').replace('.svg', '');
    let puzzle = puzzleCache.get(filename);
    if (!puzzle) {
      puzzle = generateLocalPuzzle(filename);
    }
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(puzzle.svg);
  }

  // 2. Application Version Endpoint
  if (pathname === '/api/v1/application/version') {
    return sendJson(res, 200, {
      success: true,
      body: "1.0.0-smiley-pro"
    });
  }

  // 3. OAuth2 Token Authentication Endpoint
  if (pathname === '/api/v1/oauth/token' && method === 'POST') {
    const body = await parseBody(req);
    const username = body.username || body.userName;
    const password = body.password;

    if (!username) {
      return sendJson(res, 400, {
        error: "invalid_request",
        error_description: "Missing username"
      });
    }

    let user = db.users.find(u => u.userName.toLowerCase() === username.toLowerCase());
    
    // Auto-create or allow demo guest login
    if (!user) {
      user = {
        id: db.users.length + 1,
        userName: username,
        password: password || "password",
        email: `${username}@smileyquest.local`,
        status: "ACTIVE",
        email_verified: "VERIFY",
        level: 10.0,
        level_eum: "Silver",
        created: new Date().toISOString()
      };
      db.users.push(user);
      saveDatabase();
    }

    const token = createToken(user.id, user.userName);
    return sendJson(res, 200, {
      access_token: token,
      token_type: "bearer",
      refresh_token: token + "_refresh",
      expires_in: 86400,
      scope: "read write trust",
      user: {
        userId: user.id,
        username: user.userName,
        userDetails: {
          userId: user.id,
          userName: user.userName,
          email: user.email,
          level: user.level,
          level_eum: user.level_eum
        }
      }
    });
  }

  // 4. Player Sign Up Endpoint
  if (pathname === '/api/v1/player/signup' && method === 'POST') {
    const body = await parseBody(req);
    const { userName, email, password } = body;

    if (!userName || !email) {
      return sendJson(res, 400, { success: false, message: "Username and email are required" });
    }

    const existing = db.users.find(u => u.userName.toLowerCase() === userName.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return sendJson(res, 200, { success: true, message: "User already exists. Logging in directly!" });
    }

    const newUser = {
      id: db.users.length + 1,
      userName: userName,
      password: password || "password123",
      email: email,
      status: "ACTIVE", // Auto-activate for smooth local experience
      email_verified: "VERIFY",
      level: 0.0,
      level_eum: "Silver",
      created: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDatabase();

    return sendJson(res, 200, {
      success: true,
      message: "sign up successfully!"
    });
  }

  // 5. Account Verification Endpoint
  if (pathname === '/api/v1/player/account/verify') {
    return sendJson(res, 200, {
      success: true,
      message: "Your account has been activated successfully!"
    });
  }

  // 6. Game Start Endpoint
  if ((pathname === '/api/v1/game/start' || pathname === '/api/v1/player/game/start') && method === 'POST') {
    const auth = verifyToken(req.headers.authorization);
    const userId = auth ? parseInt(auth.sub, 10) : 1;
    const user = db.users.find(u => u.id === userId) || db.users[0];

    const scoreId = Date.now();
    const scoreDetailsId = scoreId + 1;
    const q = await getQuestion();

    db.activeGames[String(scoreId)] = {
      userId: user.id,
      userName: user.userName,
      scoreId: scoreId,
      scoreDetailsId: scoreDetailsId,
      currentSolution: q.solution,
      currentQuestion: q.question,
      points: 0,
      startTime: Date.now(),
      answersCount: 0
    };

    return sendJson(res, 200, {
      success: true,
      message: "Game started",
      body: {
        score_id: scoreId,
        score_details_id: scoreDetailsId,
        question: q.question
      }
    });
  }

  // 7. Game Answer Check Endpoint
  if (pathname === '/api/v1/game/answer/check' && method === 'POST') {
    const body = await parseBody(req);
    const scoreId = String(body.score_id);
    const answer = parseInt(body.answer, 10);

    const game = db.activeGames[scoreId];
    let isCorrect = false;

    if (game) {
      if (answer === game.currentSolution) {
        isCorrect = true;
        game.points += 10;
        game.answersCount += 1;

        // Upgrade user level
        const user = db.users.find(u => u.id === game.userId);
        if (user) {
          user.level += 10;
          if (user.level >= 500) user.level_eum = "Diamond";
          else if (user.level >= 250) user.level_eum = "Platinum";
          else if (user.level >= 100) user.level_eum = "Gold";
          else user.level_eum = "Silver";
          saveDatabase();
        }
      }

      // Fetch next question
      const nextQ = await getQuestion();
      game.scoreDetailsId = Date.now();
      game.currentSolution = nextQ.solution;
      game.currentQuestion = nextQ.question;

      return sendJson(res, 200, {
        success: true,
        body: {
          question: nextQ.question,
          score_details_id: game.scoreDetailsId,
          score_id: game.scoreId,
          point: game.points,
          is_true: isCorrect
        }
      });
    }

    // Fallback if session expired
    const fallbackQ = await getQuestion();
    return sendJson(res, 200, {
      success: true,
      body: {
        question: fallbackQ.question,
        score_details_id: Date.now(),
        score_id: scoreId || Date.now(),
        point: 0,
        is_true: false
      }
    });
  }

  // 8. Game End Endpoint
  if (pathname === '/api/v1/game/end' && method === 'POST') {
    const body = await parseBody(req);
    const scoreId = String(body.score_id);
    const game = db.activeGames[scoreId];
    const finalPoints = game ? game.points : (parseFloat(body.points) || 0);
    const playerName = game ? game.userName : "Player";

    if (game) {
      // Record to top scores
      const existingScoreIdx = db.topScores.findIndex(s => s.userName === playerName);
      if (existingScoreIdx >= 0) {
        if (finalPoints > db.topScores[existingScoreIdx].point) {
          db.topScores[existingScoreIdx].point = finalPoints;
          db.topScores[existingScoreIdx].date = new Date().toISOString();
        }
      } else {
        db.topScores.push({
          id: db.topScores.length + 1,
          userName: playerName,
          point: finalPoints,
          date: new Date().toISOString(),
          level_eum: "Silver"
        });
      }

      // Sort descending
      db.topScores.sort((a, b) => b.point - a.point);
      saveDatabase();
      delete db.activeGames[scoreId];
    }

    return sendJson(res, 200, {
      success: true,
      body: {
        score_id: scoreId,
        total_point: finalPoints
      }
    });
  }

  // 9. Top Scores Leaderboard Endpoint
  if (pathname === '/api/v1/game/top-score' && method === 'GET') {
    // Sort descending
    const sorted = [...db.topScores].sort((a, b) => b.point - a.point);
    return sendJson(res, 200, {
      success: true,
      body: sorted
    });
  }

  // Default 404
  return sendJson(res, 404, {
    success: false,
    message: `Endpoint ${pathname} not found`
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`=======================================================`);
  console.log(`  Smiley Quest Game Backend Server running on:`);
  console.log(`  -> http://localhost:${PORT}`);
  console.log(`  -> Application: http://localhost:${PORT}/api/v1/application/version`);
  console.log(`  -> Leaderboard: http://localhost:${PORT}/api/v1/game/top-score`);
  console.log(`=======================================================`);
});
