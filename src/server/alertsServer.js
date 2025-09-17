// Security Alerts WebSocket Server
import realTimeAlerts from '../utils/realTimeAlerts.js';
import dotenv from 'dotenv';

dotenv.config();

const WEBSOCKET_PORT = process.env.ALERTS_WEBSOCKET_PORT || 8080;

// Inicializar servidor de alertas
realTimeAlerts.initWebSocketServer(WEBSOCKET_PORT);
realTimeAlerts.startCleanupInterval();

console.log(`🚨 Security Alerts Server started on port ${WEBSOCKET_PORT}`);
console.log('📡 WebSocket endpoint: ws://localhost:' + WEBSOCKET_PORT);
console.log('🔗 Connect your dashboard to receive real-time security alerts');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔌 Shutting down Security Alerts Server...');
  realTimeAlerts.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🔌 Shutting down Security Alerts Server...');
  realTimeAlerts.stop();
  process.exit(0);
});

// Manter o processo ativo
process.stdin.resume();