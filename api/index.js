const express = require("express");
const app = express();

const BUILD_TIME = new Date().toISOString();

app.get("/api/lastup", (req, res) => {
    res.json({ date: BUILD_TIME });
});

module.exports = app;
