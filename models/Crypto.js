const mongoose = require("mongoose");

const timeSeriesSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  price: Number,
  marketCap: Number,
  change24h: Number,
});

// Crypto currency Data Schema
const cryptoSchema = new mongoose.Schema({
  coin: { type: String, required: true },
  timestamp: [timeSeriesSchema],
});

module.exports = mongoose.model("Crypto", cryptoSchema);
