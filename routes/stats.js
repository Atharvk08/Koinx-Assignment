const express = require("express");
const router = express.Router();
const Crypto = require("../models/Crypto");

router.get("/", async (req, res) => {
  const coin = req.query.coin;
  if (!coin) {
    return res.status(400).send({ error: "Coin parameter is required" });
  }

  const data = await Crypto.findOne({ coin }).sort({ timestamp: -1 });
  const cryptoData = data.timestamp[data.timestamp.length - 1];
  console.log(cryptoData);

  res.send({
    price: cryptoData.price,
    marketCap: cryptoData.marketCap,
    "24hChange": cryptoData.change24h,
  });
});

module.exports = router;
