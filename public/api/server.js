const express = require("express");
const app = express();

const BUILD_TIME = new Date().toISOString();

app.get("/api/lastup", (req, res) => {
    res.json({
        date: BUILD_TIME
    });
});

app.use(express.static("public"));

app.listen(3000, () => {
    console.log("Server jalan di 3000");
});
