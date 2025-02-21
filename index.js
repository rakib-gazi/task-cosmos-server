const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
async function run() {
    try {
  
      // Root Api
    app.get("/", (req, res) => {
        res.send("DnD  server is running");
      });
     
    } finally {
    }
  }
  run();
  
  app.listen(port, () => {});