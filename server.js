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

app.get("/coin", (req, res) => {
  fetchCryptoData();
  res.send("successfully updated");
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
