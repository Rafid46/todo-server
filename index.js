const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j1gssm8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const taskCollection = client.db("todo").collection("tasks");
    // Connect the client to the server	(optional starting in v4.7)
    // get
    // app.get("/todo/tasks", async (req, res) => {
    //   const result = await taskCollection.find().toArray();
    //   res.send(result);
    // });
    // get
    app.get("/todo/tasks", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });
    // post
    app.post("/todo/tasks", async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });
    // delete
    app.delete("/todo/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });
    // patch for dnd
    app.patch("/todo/tasks/patch/:id", async (req, res) => {
      const taskId = req.params.id;
      const { status } = req.body;
      const result = await taskCollection.updateOne(
        { _id: new ObjectId(taskId) },
        { $set: { status } }
      );
      res.send(result);
    });
    // update task
    app.patch("/todo/tasks/update/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const list = req.body;
      console.log("Received data:", req.body);
      const Info = {
        $set: {
          name: list.name,
          description: list.description,
          deadline: list.deadline,
          priority: list.priority,
        },
      };
      const result = await taskCollection.updateOne(filter, Info);
      console.log("update result", result);
      res.send(result);
    });
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("todo server is running");
});
app.listen(port, () => {
  console.log(`todo server in running port:${port}`);
});
