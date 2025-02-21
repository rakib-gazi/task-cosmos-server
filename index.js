const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.whnyl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const taskCollection = client
      .db("Task Cosmos")
      .collection("tasks");
    // Root Api
    app.get("/", (req, res) => {
      res.send("DnD  server is running");
    });
    // tasks get api for getting all task from database
    app.get("/tasks", async (req, res) => {
        const tasks = await taskCollection.find().toArray();
        res.json(tasks);
    });
  } finally {
  }
}
run();

app.listen(port, () => {});
