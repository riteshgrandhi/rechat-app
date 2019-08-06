const path = require("path");
const express = require("express");
const app = express();
const port = 3001;

app.listen(port, () => {
  console.log(`listening on port: ${port}...`);
});

app.get("/api/data", (req, res) => {
  res.send({ express: "Express server is connected!" });
});
