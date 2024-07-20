const WebSocket = require('ws');

let clients = [];

// Initialize WebSocket server
const initWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', ws => {
    console.log('Client connected');
    clients.push(ws);

    ws.on('close', () => {
      console.log('Client disconnected');
      clients = clients.filter(client => client !== ws);
    });
  });
};

const broadcastJobUpdate = (job) => {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(job));
    }
  });
};

module.exports = { initWebSocket, broadcastJobUpdate };
