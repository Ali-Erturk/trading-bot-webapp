const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const { config } = require("./config");
const { initDb } = require("./db/database");
const { startBinanceStream, attachClient } = require("./services/binanceStream");

const health = require("./routes/health");
const market = require("./routes/market");
const trade = require("./routes/trade");

initDb();

const app = express();
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.use("/api", health);
app.use("/api/market", market);
app.use("/api/trade", trade);

const server = app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});

const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws) => {
  attachClient(ws);
});

startBinanceStream();
