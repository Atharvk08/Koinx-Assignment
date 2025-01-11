const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const axis = require("axios");

const app = express();

app.listen(3000, () => {
  console.log("Server listening on port 5000");
});
