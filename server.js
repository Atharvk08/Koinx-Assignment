const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const axios = require("axios");

require("dotenv").config();

const app = express();

// Crypto currency Data Schema
const cryptoSchema = new mongoose.Schema({
  coin: String,
  price: Number,
  marketCap: Number,
  change: Number,
});

// fetch data from the coin url
const URL = process.env.CRYPTO_URL;

async function fetchCryptoData() {
  const coins = ["bitcoin", "matic-network", "ethereum"];

  for (const coin of coins) {
    queryURL =
      URL +
      `?ids=${coin}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true&precision=3`;
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-cg-demo-api-key": process.env.API_KEY,
      },
    };
    const response = await axios.get(queryURL, options);
    const data = response.data[coin];
    console.log(data);
  }
}

app.get("/coin", (req, res) => {
  fetchCryptoData();
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
