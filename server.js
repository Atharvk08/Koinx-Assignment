const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const axios = require("axios");
const Crypto = require("./models/Crypto");

require("dotenv").config();

const app = express();

// database connect
mongoose
  .connect("mongodb://localhost:27017/cryptoDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDb Connected"))
  .catch((err) => console.log(err));

// fetch data from the coin url
const URL = process.env.CRYPTO_URL;

async function fetchCryptoData() {
  const coins = ["bitcoin", "matic-network", "ethereum"];

  queryURL =
    URL +
    `?ids=${coins.join(
      ","
    )}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true&precision=3`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": process.env.API_KEY,
    },
  };

  try {
    const response = await axios.get(queryURL, options);
    const data = response.data;
    console.log(data);

    for (const coin of coins) {
      const CryptoRecord = await Crypto.findOne({ coin });
      if (CryptoRecord) {
        CryptoRecord.timestamp.push({
          price: data[coin].usd,
          marketCap: data[coin].usd_market_cap,
          change24: data[coin].usd_24h_change,
        });
        console.log(CryptoRecord.timestamp.length);
        await CryptoRecord.save();
      } else {
        const newCryptoRecord = new Crypto({
          coin: coin,
          timeSeries: [
            {
              price: data[coin].usd,
              marketCap: data[coin].usd_market_cap,
              change24h: data[coin].usd_24h_change,
            },
          ],
        });
        await newCryptoRecord.save();
      }

      console.log(`Updated time series for ${coin}`);
    }
  } catch (error) {
    console.error("error fetching data", error);
  }
}

// Schedule the function to run every 2 minutes
// cron.schedule("*/2 * * * *", fetchCryptoData);

app.get("/coin", (req, res) => {
  fetchCryptoData();
  res.send("successfully updated");
});

app.get("/stats", async (req, res) => {
  const coin = req.query.coin;
  if (!coin) {
    return res.status(400).send({ error: "Coin parameter is required" });
  }

  const data = await Crypto.findOne({ coin }).sort({ timestamp: -1 });
  //   .sort({ timestamp: -1 });
  const cryptoData = data.timestamp[data.timestamp.length - 1];
  console.log(cryptoData);

  res.send({
    price: cryptoData.price,
    marketCap: cryptoData.marketCap,
    "24hChange": cryptoData.change24h,
  });
});

app.get("/deviation", async (req, res) => {
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

const calculateStandardDeviation = (arr) => {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(
    arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length
  );
};

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
