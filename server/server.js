const path = require("path");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`listening on port: ${port}...`);
});

app.get("/api/data", (req, res) => {
  res.send({ express: "express backend is connected" });
});

app.get("/", (req, res) => {
  var _p = path.resolve(__dirname, "../client/dist/index.html");
  res.sendFile(_p, err => {
    console.log(_p);
  });
});
