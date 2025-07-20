import { WebSocketServer } from "ws";

// Create a WebSocket server on a configurable port (default 8080)
const wss = new WebSocketServer({
  port: process.env.WS_PORT ? Number(process.env.WS_PORT) : 8080,
});

wss.on("connection", (ws) => {
  // Optionally, handle connection events
  ws.send(
    JSON.stringify({
      type: "connected",
      message: "WebSocket connection established",
    })
  );
});

// Broadcast a message to all connected clients
export function broadcastStreamerLive(streamer: {
  id: string;
  name: string;
  avatarUrl?: string;
  platform: string;
}) {
  const payload = JSON.stringify({
    type: "streamer_live",
    streamer,
  });
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });
}

export default wss;
