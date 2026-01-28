require("dotenv").config();

const config = {
  port: Number(process.env.PORT || 8000),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  binanceSymbol: (process.env.BINANCE_SYMBOL || "btcusdt").toLowerCase(),
  binanceWsUrl: process.env.BINANCE_WS_URL || "wss://stream.binance.com:9443/ws",
  dbPath: process.env.DB_PATH || "./tradingbot.sqlite",
};

module.exports = { config };
