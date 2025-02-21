const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
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
    const taskCollection = client.db("Task Cosmos").collection("tasks");
    // Root Api
    app.get("/", (req, res) => {
      res.send("DnD  server is running");
    });
    // socket.io connection
    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
      });
    });
    // tasks get api for getting all task from database
    app.get("/tasks", async (req, res) => {
      const tasks = await taskCollection.find().toArray();
      res.json(tasks);
    });
    // tasks post api for added task to database
    app.post("/tasks", async (req, res) => {
      const { title, description, category } = req.body;

      if (!title || title.length > 50) {
        return res.json({
          error: "Title is required and must be under 50 characters",
        });
      }

      const newTask = {
        title,
        description: description || "",
        category: category || "To-Do",
        timestamp: new Date(),
      };

      const result = await taskCollection.insertOne(newTask);
    //   emit for realtime update
      io.emit("task_updated", { action: "add", task: newTask });
      res.json(result);
    });
    // task put api for update tasks
    app.put("/tasks/:id", async (req, res) => {
      const { id } = req.params;
      const { title, description, category } = req.body;
      const query = { _id: new ObjectId(id) };

      const updatedTask = {
        $set: {
          title,
          description,
          category,
        },
      };
      const result = await taskCollection.updateOne(query, updatedTask);
    //   emit for realtime update
    io.emit("task_updated", { action: "update", taskId: id, updatedTask });
      res.json(result);
    });
    // task delete api for removed tasks
    app.delete("/tasks/:id", async (req, res) => {
      const { id } = req.params;
      const result = await taskCollection.deleteOne({ _id: new ObjectId(id) });
    //   emit for realtime update
    io.emit("task_updated", { action: "delete", taskId: id });
      res.json(result);
    });
  } finally {
  }
}
run();

app.listen(port, () => {});
