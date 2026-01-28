const express = require("express");
const { getDb } = require("../db/database");
const { config } = require("../config");

const router = express.Router();

const portfolio = {
  cash: 10000,
  positions: {}, // symbol -> { qty, avg_price }
};

function buy(symbol, qty, price) {
  const cost = qty * price;
  if (cost > portfolio.cash) return { ok: false, status: "INSUFFICIENT_CASH" };

  const pos = portfolio.positions[symbol] || { qty: 0, avg_price: 0 };
  const newQty = pos.qty + qty;
  pos.avg_price = ((pos.avg_price * pos.qty) + (price * qty)) / newQty;
  pos.qty = newQty;

  portfolio.positions[symbol] = pos;
  portfolio.cash -= cost;

  return { ok: true, status: "FILLED" };
}

function sell(symbol, qty, price) {
  const pos = portfolio.positions[symbol] || { qty: 0, avg_price: 0 };
  if (qty > pos.qty) return { ok: false, status: "INSUFFICIENT_POSITION" };

  pos.qty -= qty;
  if (pos.qty === 0) pos.avg_price = 0;

  portfolio.positions[symbol] = pos;
  portfolio.cash += qty * price;

  return { ok: true, status: "FILLED" };
}

function logTrade(side, qty, price, status) {
  const db = getDb();
  db.prepare(
    "INSERT INTO trades(symbol, side, qty, price, status, ts_ms) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(config.binanceSymbol, side, qty, price, status, Date.now());
}

router.get("/portfolio", (req, res) => {
  res.json(portfolio);
});

router.get("/history", (req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT ts_ms, side, qty, price, status FROM trades WHERE symbol = ? ORDER BY ts_ms DESC LIMIT 200"
    )
    .all(config.binanceSymbol)
    .reverse();

  res.json(rows);
});

router.post("/buy", (req, res) => {
  const qty = Number(req.body.qty);
  const price = Number(req.body.price);

  if (!Number.isFinite(qty) || !Number.isFinite(price) || qty <= 0 || price <= 0) {
    return res.status(400).json({ ok: false, error: "Invalid qty/price" });
  }

  const result = buy(config.binanceSymbol, qty, price);
  logTrade("BUY", qty, price, result.status);

  res.json({ ...result, portfolio });
});

router.post("/sell", (req, res) => {
  const qty = Number(req.body.qty);
  const price = Number(req.body.price);

  if (!Number.isFinite(qty) || !Number.isFinite(price) || qty <= 0 || price <= 0) {
    return res.status(400).json({ ok: false, error: "Invalid qty/price" });
  }

  const result = sell(config.binanceSymbol, qty, price);
  logTrade("SELL", qty, price, result.status);

  res.json({ ...result, portfolio });
});

module.exports = router;
