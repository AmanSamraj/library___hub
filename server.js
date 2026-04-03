const express = require("express");
const cors = require("cors");
const path = require("path");
const apiRoutes = require("./routes");
const { PORT } = require("./config/env");
const { connectDatabase } = require("./config/database");

const app = express();

app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, "pages")));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.redirect("/index.html");
});

app.use("/api", apiRoutes);

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    message: "Internal server error",
    error: error.message
  });
});

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
    .then(() => {
      console.log("MongoDB connected successfully in server.js");
      startServer();
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
      startServerWithFallback();
    });
}

module.exports = { app, connectDatabase };
