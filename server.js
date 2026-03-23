const express = require("express");
const cors = require("cors");
const path = require("path");
const apiRoutes = require("./routes");
const { PORT } = require("./config/env");
const { connectDatabase } = require("./config/database");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.use("/api", apiRoutes);

function startServer() {
  app.listen(PORT, () => {
    console.log("Library Hub server running on port " + PORT);
  });
}

function startServerWithFallback() {
  app.listen(PORT, () => {
    console.log("Library Hub server running on port " + PORT + " with catalog fallback mode");
  });
}

if (require.main === module) {
  connectDatabase()
    .then(startServer)
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
      startServerWithFallback();
    });
}

module.exports = { app, connectDatabase };
