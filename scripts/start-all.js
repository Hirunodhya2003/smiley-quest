const { spawn } = require('child_process');
const path = require('path');

console.log('🎮 Starting Smiley Quest Game - Full Stack Local Environment...\n');

// 1. Start Server
const serverProcess = spawn('node', [path.join(__dirname, '../server/server.js')], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '5001' }
});

serverProcess.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
});

// 2. Start Frontend
setTimeout(() => {
  console.log('⚡ Launching React Game Frontend...');
  const frontendProcess = spawn('npm', ['start'], {
    cwd: path.join(__dirname, '../smile-game-frontend'),
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: '3000',
      REACT_APP_API_URL: 'http://localhost:5001',
      BROWSER: 'none' // Don't automatically try opening external browser in CLI
    }
  });

  frontendProcess.on('error', (err) => {
    console.error('❌ Failed to start frontend:', err);
  });

  const cleanup = () => {
    console.log('\n🛑 Stopping servers...');
    serverProcess.kill('SIGTERM');
    frontendProcess.kill('SIGTERM');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}, 1000);
