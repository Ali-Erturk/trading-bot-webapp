const WebSocket = require("ws");
const { config } = require("../config");
const { getDb } = require("../db/database");

const state = {
  clients: new Set(),
  ws: null,
  reconnectMs: 1000,
  ticksReceived: 0,
};

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  for (const client of state.clients) {
    if (client.readyState === 1) client.send(msg);
  }
}

function saveTick(symbol, price, ts_ms) {
  const db = getDb();
  const stmt = db.prepare("INSERT INTO ticks(symbol, price, ts_ms) VALUES (?, ?, ?)");
  stmt.run(symbol, price, ts_ms);
}

function startBinanceStream() {
  const stream = `${config.binanceSymbol}@trade`;
  const url = `${config.binanceWsUrl}/${stream}`;

  const ws = new WebSocket(url);
  state.ws = ws;

  ws.on("open", () => {
    state.reconnectMs = 1000;
    broadcast({ type: "status", ok: true, message: `Connected: ${stream}` });
  });

  ws.on("message", (data) => {
    try {
      const json = JSON.parse(data.toString());
      const price = Number(json.p);
      const qty = Number(json.q);
      const ts_ms = Number(json.T);

      if (!Number.isFinite(price) || !Number.isFinite(ts_ms)) return;

      state.ticksReceived += 1;
      saveTick(config.binanceSymbol, price, ts_ms);

      broadcast({
        type: "tick",
        symbol: config.binanceSymbol,
        price,
        qty,
        ts_ms,
      });
    } catch {
      // ignore parse errors
    }
  });

  ws.on("close", () => {
    broadcast({ type: "status", ok: false, message: "Disconnected. Reconnecting..." });
    scheduleReconnect();
  });

  ws.on("error", () => {
    // ws will also emit close; keep quiet
  });
}

function scheduleReconnect() {
  const delay = state.reconnectMs;
  state.reconnectMs = Math.min(state.reconnectMs * 2, 30000);
  setTimeout(() => startBinanceStream(), delay);
}

function attachClient(clientWs) {
  state.clients.add(clientWs);

  clientWs.on("close", () => {
    state.clients.delete(clientWs);
  });

  clientWs.send(JSON.stringify({ type: "hello", symbol: config.binanceSymbol }));
}

function metrics() {
  return {
    ws_clients: state.clients.size,
    ticks_received: state.ticksReceived,
  };
}

module.exports = { startBinanceStream, attachClient, metrics };
