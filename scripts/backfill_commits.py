#!/usr/bin/env python3
"""
Backdated commit script for smiley-quest.
Fills GitHub contribution graph Jan 1 – Nov 19, 2026 with organic-looking commit history.
"""

import subprocess
import os
import random
from datetime import date, timedelta

REPO_DIR = "/home/h/Downloads/game"
TZ = "+05:30"

# Commit message pool — realistic, project-appropriate
COMMIT_MESSAGES = [
    # Initial / setup
    "chore: initialize project structure",
    "chore: add .gitignore and root package.json",
    "chore: scaffold React frontend with create-react-app",
    "chore: setup Node.js backend server skeleton",
    "chore: configure project workspace scripts",
    "chore: add README with project overview",

    # Backend
    "feat: implement HTTP server with routing",
    "feat: add user registration endpoint",
    "feat: add login with JWT auth",
    "feat: create game session management",
    "feat: add leaderboard API endpoint",
    "feat: implement puzzle generator algorithm",
    "feat: add score calculation logic",
    "feat: add power-up system to backend",
    "feat: implement streak bonus scoring",
    "feat: add guest play session support",
    "feat: persist scores to db.json",
    "feat: add pagination to leaderboard",
    "fix: resolve CORS headers on API responses",
    "fix: correct session expiry logic",
    "fix: handle duplicate username on register",
    "fix: null check on leaderboard empty state",
    "refactor: extract route handlers to separate modules",
    "refactor: simplify puzzle generation with seeded random",
    "refactor: consolidate auth middleware",
    "perf: cache leaderboard response for 5s",
    "test: add unit tests for score calculator",
    "test: test puzzle generator edge cases",

    # Frontend setup
    "feat: setup React Router with page structure",
    "feat: add global CSS design system variables",
    "feat: implement glassmorphism card component",
    "feat: add neon accent color palette",
    "chore: install react-bootstrap-icons",
    "chore: configure proxy to backend API",

    # Auth page
    "feat: build Auth page with sign in / sign up tabs",
    "feat: add guest play button to auth screen",
    "feat: add form validation on auth inputs",
    "style: polish auth card with glassmorphism effect",
    "fix: prevent form resubmit on enter key",
    "feat: add quick demo login button",

    # Navbar
    "feat: build NavBar component with glass effect",
    "feat: add sound toggle button to navbar",
    "feat: add player profile dropdown in navbar",
    "feat: add How to Play modal trigger in navbar",
    "style: add animated logo pulse to navbar",
    "fix: navbar z-index overlap with modal",

    # Banner / Lobby
    "feat: build game lobby Banner component",
    "feat: add avatar picker with 8 emoji options",
    "feat: add champion preview section to lobby",
    "feat: add Play Now and Leaderboard buttons",
    "style: animate lobby orbs with float keyframes",
    "style: add gradient shimmer to play button",

    # Quiz page
    "feat: build Quiz page with 0–9 keypad",
    "feat: add countdown timer HUD to quiz",
    "feat: add keyboard hotkey support (0–9, Enter)",
    "feat: implement freeze power-up (+10s)",
    "feat: implement 50/50 clue power-up",
    "feat: add streak combo multiplier display",
    "feat: show current score live during quiz",
    "feat: animate correct/wrong answer feedback",
    "fix: timer not resetting between questions",
    "fix: keypad double-submit on fast click",
    "refactor: extract QuizHUD into sub-component",
    "style: add neon glow to active keypad button",
    "perf: debounce answer submission handler",

    # Game over page
    "feat: build Game Over performance report page",
    "feat: add tier XP progress bar to game over",
    "feat: add New Personal Best banner",
    "feat: add Share button with score summary",
    "style: animate score counter on game over",
    "fix: XP bar overflow on max tier",

    # Leaderboard / point table
    "feat: build Leaderboard with top 3 podium",
    "feat: add full rankings table to leaderboard",
    "feat: add search filter to leaderboard",
    "style: gold/silver/bronze podium styling",
    "fix: leaderboard not refreshing after game",

    # Audio
    "feat: implement Web Audio API synthesizer",
    "feat: add correct answer sound effect",
    "feat: add wrong answer buzz sound",
    "feat: add countdown tick sound",
    "feat: add fanfare on game completion",
    "feat: add power-up activation sound",
    "fix: audio context unlock on mobile Safari",

    # Confetti
    "feat: add canvas confetti on high score",
    "feat: randomize confetti particle colors",
    "perf: cap confetti particles at 150",

    # API utils
    "feat: add centralized api.js service layer",
    "refactor: replace fetch calls with api service",
    "fix: handle 401 token expiry in api service",

    # Misc / docs / chore
    "docs: update README with setup instructions",
    "docs: add API endpoint documentation",
    "docs: add screenshots section to README",
    "chore: add start.sh launcher script",
    "chore: add scripts/start-all.js orchestrator",
    "chore: bump React to latest patch",
    "chore: add engine field to package.json",
    "style: fix ESLint warnings in quiz component",
    "style: remove unused imports across components",
    "refactor: move utils to src/utils directory",
    "fix: mobile viewport height on quiz page",
    "fix: score not persisting after page refresh",
    "feat: add loading spinner on API calls",
    "feat: add error toast notification component",
    "feat: add offline mode detection banner",
    "refactor: cleanup dead code in Banner.js",
    "test: add smoke test for auth flow",
    "chore: update .gitignore to exclude build artifacts",
    "fix: HowToPlayModal close button not working",
    "style: improve responsive layout for mobile",
    "feat: add page transition animations",
    "perf: lazy load leaderboard page",
    "docs: add contribution guide to README",
    "chore: add MIT license file",
    "fix: verification page redirect loop",
    "feat: add dark mode persistence via localStorage",
    "refactor: standardize error handling across pages",
    "style: tweak color contrast for accessibility",
    "feat: show answer feedback duration configurable",
    "fix: avatar selection not saving to profile",
    "feat: add question difficulty indicator",
    "chore: clean up console.log statements",
    "fix: prevent negative scores on streak loss",
    "feat: add animated background grid pattern",
    "style: add hover glow to leaderboard rows",
    "refactor: convert class components to hooks",
    "feat: add time-attack mode toggle",
    "docs: document audio utility API",
    "fix: confetti not triggering on tied personal best",
    "perf: memoize puzzle generation with useMemo",
    "feat: add quiz progress bar",
    "style: polish HowToPlay modal rule cards",
    "fix: sound toggle state lost on navigation",
    "feat: add per-question analytics tracking",
    "refactor: extract confetti to standalone util",
    "chore: update dependencies to latest minor versions",
    "feat: add emoji reaction on streak milestone",
    "fix: leaderboard search case sensitivity",
]

def run(cmd, env=None):
    result = subprocess.run(cmd, shell=True, cwd=REPO_DIR, env=env,
                            capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  ERROR: {result.stderr.strip()}")
    return result.returncode == 0

def git_commit(message, date_str):
    """Make a commit with a specific author/committer date."""
    full_date = f"{date_str}T{random.randint(8,22):02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d}{TZ}"
    env = os.environ.copy()
    env["GIT_AUTHOR_DATE"] = full_date
    env["GIT_COMMITTER_DATE"] = full_date
    # Stage any changes (or use --allow-empty for extra commits)
    subprocess.run("git add -A", shell=True, cwd=REPO_DIR, capture_output=True)
    result = subprocess.run(
        f'git commit --allow-empty -m "{message}"',
        shell=True, cwd=REPO_DIR, env=env,
        capture_output=True, text=True
    )
    return result.returncode == 0

def commits_for_day(d):
    """
    Return how many commits to make on a given date.
    Uses weighted random to look organic:
    - Most days: 1–4 commits
    - Some days: 5–9 commits (active work)
    - Few days: 0 commits (days off)
    - Feature-push periods get more
    """
    weekday = d.weekday()  # 0=Mon, 6=Sun
    month = d.month

    # Weekend reduction
    if weekday == 6:  # Sunday
        if random.random() < 0.45:
            return 0
        return random.choices([1, 2, 3], weights=[50, 35, 15])[0]
    if weekday == 5:  # Saturday
        if random.random() < 0.30:
            return 0
        return random.choices([1, 2, 3, 4], weights=[40, 35, 20, 5])[0]

    # Heavy periods: Jan (kickoff), Mar (features), Jun-Jul (UI), Sep-Oct (polish), Nov (final)
    if month in (1,):
        weights = [0, 10, 25, 30, 20, 10, 4, 1]
    elif month in (3, 4):
        weights = [5, 15, 25, 25, 18, 10, 2, 0]
    elif month in (6, 7):
        weights = [0, 8, 20, 28, 25, 14, 4, 1]
    elif month in (9, 10):
        weights = [2, 12, 22, 28, 22, 10, 3, 1]
    elif month == 11:
        weights = [0, 5, 18, 28, 26, 16, 6, 1]
    elif month == 2:
        weights = [8, 18, 28, 25, 14, 6, 1, 0]
    elif month == 5:
        weights = [5, 15, 26, 28, 18, 7, 1, 0]
    elif month == 8:
        weights = [4, 14, 24, 28, 20, 8, 2, 0]
    else:
        weights = [5, 15, 25, 28, 18, 7, 2, 0]

    return random.choices(range(8), weights=weights)[0]

def main():
    start = date(2026, 1, 1)
    end = date(2026, 11, 19)

    messages = COMMIT_MESSAGES.copy()
    random.shuffle(messages)
    msg_index = 0

    total_commits = 0
    current = start

    print(f"Starting backdated commit generation: {start} → {end}")
    print("=" * 60)

    while current <= end:
        n = commits_for_day(current)
        if n > 0:
            date_str = current.strftime("%Y-%m-%d")
            for i in range(n):
                # Cycle through messages, reshuffling when exhausted
                if msg_index >= len(messages):
                    random.shuffle(messages)
                    msg_index = 0
                msg = messages[msg_index]
                msg_index += 1
                success = git_commit(msg, date_str)
                if success:
                    total_commits += 1
            print(f"  {date_str} ({current.strftime('%a')}) → {n} commits")
        current += timedelta(days=1)

    print("=" * 60)
    print(f"Total commits created: {total_commits}")
    print("Done! Now push with: git push -u origin main")

if __name__ == "__main__":
    main()
