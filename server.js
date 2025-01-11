const express = require("express");
const mongoose = require("mongoose");

const app = express();

// database connect
mongoose
  .connect("mongodb://localhost:27017/cryptoDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDb Connected"))
  .catch((err) => console.log(err));

const deviationRouter = require("./routes/deviation");
const statsRouter = require("./routes/stats");
const cryptoPriceUpdater = require("./routes/cryptoPriceUpdater");

app.use("/deviation", deviationRouter);
app.use("/coins", cryptoPriceUpdater);
app.use("/stats", statsRouter);

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
