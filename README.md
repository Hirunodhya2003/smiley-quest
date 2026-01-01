# 😃 Smiley Quest — Math Puzzle Arcade

An upgraded, full-stack arcade web game where players solve logic puzzles under a 60-second countdown timer. Built with a modern dark cyber-arcade UI, real-time procedural sound synthesizer, interactive 0-9 keypad with keyboard hotkeys, streak combo multipliers, a global hall-of-fame leaderboard, and zero-configuration local execution.

---

## ⚡ Quick Start (Run Locally)

You can launch both the **Backend API** and the **Frontend Web App** with a single command:

```bash
# 1. Start everything with one command
npm start
# or
./start.sh
```

- **Frontend App**: [http://localhost:3001](http://localhost:3001) (or [http://localhost:3000](http://localhost:3000))
- **Backend API Server**: [http://localhost:5001](http://localhost:5001)
  - Version check: [http://localhost:5001/api/v1/application/version](http://localhost:5001/api/v1/application/version)
  - Leaderboard: [http://localhost:5001/api/v1/game/top-score](http://localhost:5001/api/v1/game/top-score)

---

## 🌟 Major Upgrades & Features

### 1. 🎨 Complete UI / UX Overhaul
- **Cyber-Arcade Aesthetic**: Deep cosmic dark background with glassmorphic cards (`backdrop-filter: blur(20px)`), glowing neon accents (cyan, purple, emerald, amber), and floating ambient math smilies.
- **Brand Identity**: Replaced placeholder names with the unified **SMILEY QUEST** arcade branding.
- **Glassmorphic Navigation Bar**: Real-time player profile pill with avatar, rank tier badge (Silver, Gold, Platinum, Diamond, Master), points counter, sound FX toggle, and account dropdown.
- **Interactive Avatar Selector**: Choose from 10 arcade avatars (`😎`, `🤠`, `🤓`, `🤖`, `🦊`, `🐱`, `🚀`, `🦁`, `👾`, `🎯`) and customize player codename on the fly.
- **"How to Play" Interactive Modal**: Clear visual guide showing deduction steps, operator precedence, and single-digit solution rules.

### 2. 🎮 Enhanced Gameplay Experience
- **Interactive 0-9 Numeric Keypad**:
  - Touch-friendly on-screen 3x3 keypad with large tactile buttons.
  - **Full Physical Keyboard Support**: Press number keys `0`–`9` on your keyboard for instant submission, `Backspace`/`Escape` to clear, and `Enter` to confirm.
- **Live HUD Display**:
  - High-visibility countdown timer with urgency color transitions (Cyan > 30s, Amber > 10s, Pulsing Red < 10s).
  - Score counter with floating animated `+10 PTS!` popups.
  - **Streak & Combo Multiplier**: Consecutive correct answers award combo multipliers (`2x`, `3x ON FIRE 🔥`, `5x UNSTOPPABLE ⚡`) with bonus XP.
- **Visual & Audio Feedback**:
  - Radiant green pulse & confetti bursts on correct answers.
  - Shake animation with sound on incorrect inputs.
  - Quick "Skip Puzzle" button.

### 3. 🔊 Web Audio API Procedural Sound Engine
- 100% self-contained synthesized sound effects with zero external audio file dependencies:
  - Keypad tactile clicks (pitch-scaled per number).
  - Ascending victory arpeggio on correct answers.
  - Low buzz on wrong answers.
  - Urgent ticking heartbeat during the final 10 seconds.
  - Retro synth fanfare on game conclusion.
  - Instant Mute / Audio On toggle with persistence.

### 4. 🏆 Hall of Fame (Leaderboard)
- **Top 3 3D Podium**:
  - 1st Place: 👑 Crowned Champion card with gold border and trophy.
  - 2nd Place: 🥈 Radiant Silver pedestal.
  - 3rd Place: 🥉 Radiant Bronze pedestal.
- **Live Search & Filter**: Search players in real-time.
- **Player Highlighting**: Highlights your own rank row with a `"YOU"` badge.

### 5. 🛠️ Robust Zero-Configuration Local Backend
- Standalone native Node.js HTTP server in `server/server.js`:
  - Starts up in **10 milliseconds** with **zero external npm dependencies**.
  - Implements 100% of the Spring Boot backend contract: OAuth2 token endpoint, player signup, verification, game start, answer checking, game end, and top scores.
  - **Offline-First SVG Fallback Generator**: Automatically generates valid, solvable math logic puzzle SVGs if the external Marc Conrad API is slow or offline.
  - Persistent JSON database in `server/data/db.json` so high scores and custom players persist across restarts.
- **Spring Boot Backend**: Included `application-local-h2.properties` configuration with H2 in-memory database and mock mailer for Java developers.

---

## 📁 Project Structure

```text
game/
├── package.json                   # Root orchestrator scripts
├── start.sh                       # Quick bash startup launcher
├── scripts/
│   └── start-all.js               # Concurrently launches backend & frontend
├── server/
│   ├── server.js                  # Native Node.js backend (OAuth2, Game Engine, SVG Generator)
│   └── data/
│       └── db.json                # Persistent local storage (users, scores, leaderboard)
├── smile-game-frontend/           # React 18 frontend
│   ├── public/                    # HTML template & assets
│   └── src/
│       ├── App.js                 # Router, global navigation & ambient orbs
│       ├── App.css                # Complete cyber-arcade design system
│       ├── components/
│       │   ├── NavBar.js          # Glass navbar with sound toggle & profile dropdown
│       │   ├── Banner.js          # Hero lobby, avatar selector & game launch
│       │   └── HowToPlayModal.js  # Tutorial & rules modal
│       ├── pages/
│       │   ├── auth/              # Sign in, register & quick demo play
│       │   ├── quiz/              # Heads-up display, timer, puzzle & 0-9 keypad
│       │   ├── game-over/         # Performance summary, rank grade & replay
│       │   ├── point-table/       # Top 3 podium & searchable leaderboard
│       │   └── verification/      # Account verification status
│       └── utils/
│           ├── api.js             # Centralized API service
│           ├── audio.js           # Procedural Web Audio API sound synthesizer
│           └── confetti.js        # Canvas particle & confetti celebration
└── spring boot backend project/   # Original Java Spring Boot project
    └── smiley-game/
        └── src/main/resources/application-local-h2.properties
```

---

## 🕹️ Test Credentials

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `player` | `password123` | Player | Default test player (Gold Tier) |
| `admin` | `admin123` | Admin | Administrator account (Platinum Tier) |
| *Guest Play* | *None* | Guest | **Instant 1-Click Play** without password |
