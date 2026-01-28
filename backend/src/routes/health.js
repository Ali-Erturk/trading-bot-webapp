const express = require("express");
const { metrics } = require("../services/binanceStream");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ ok: true, ...metrics() });
});

module.exports = router;
