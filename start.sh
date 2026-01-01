#!/usr/bin/env bash
# Smiley Quest Game - Local Launcher
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "    🌟 Starting Smiley Quest Game (Full Stack) 🌟         "
echo "=========================================================="
echo "Backend:  http://localhost:5001"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop anytime."
echo "=========================================================="

node scripts/start-all.js
