const express = require("express");
const { getDb } = require("../db/database");
const { config } = require("../config");

const router = express.Router();

router.get("/ticks", (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit || 200), 10), 2000);
  const db = getDb();

  const rows = db
    .prepare("SELECT ts_ms, price FROM ticks WHERE symbol = ? ORDER BY ts_ms DESC LIMIT ?")
    .all(config.binanceSymbol, limit)
    .reverse();

  res.json(rows);
});

module.exports = router;
