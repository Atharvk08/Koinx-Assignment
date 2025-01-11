const express = require("express");
const router = express.Router();
const Crypto = require("../models/Crypto");

const calculateStandardDeviation = (arr) => {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(
    arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length
  );
};

router.get("/", async (req, res) => {
  const coin = req.query.coin;
  if (!coin) {
    return res.status(400).send({ error: "Coin parameter is required" });
  }
  try {
    const data = await Crypto.findOne({ coin });
    if (!data) {
      return res.status(404).send({ error: "Coin not found" });
    }

    const prices = data.timestamp.slice(-100).map((entry) => entry.price);

    if (prices.length < 2) {
      return res.status.send({
        error: "not enough data to calculate deviation",
      });
    }

    const deviation = calculateStandardDeviation(prices);
    res.json({
      deviation: parseFloat(deviation.toFixed(2)),
    });
  } catch (error) {
    console.error("Error fetchin deviation: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
