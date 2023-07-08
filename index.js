const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.bbqqyyb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    client.connect();
    const postsCollection = client.db("bootcamp-client").collection("posts");
    const usersCollection = client.db("bootcamp-client").collection("users");
    const commentsCollection = client
      .db("bootcamp-client")
      .collection("comments");
    // root page
    app.get("/", (req, res) => {
      res.send("bootcamp server running");
    });

    // get posts from mongodb service collection
    app.get("/posts", async (req, res) => {
      const query = {};
      const result = await postsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/media/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await postsCollection.findOne(query);
      res.send(result);
    });
    app.get("/mostLikedPosts", async (req, res) => {
      const query = {};
      const posts = await postsCollection
        .find(query)
        .sort({ likes: -1 })
        .limit(3)
        .toArray();
      res.send(posts);
    });

    // post comments to mongodb database
    app.post("/posts", async (req, res) => {
      let query = req.body;
      var d = new Date();
      var date = d.getDate();
      var month = d.getMonth() + 1;
      var year = d.getFullYear();
      var dateStr = date + "/" + month + "/" + year;
      query.date = dateStr;
      const review = await postsCollection.insertOne(query);
      res.send(review);
    });

    app.patch("/likes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const selectedPost = await postsCollection.findOne(query);
      const like = selectedPost.likes;
      const updatedDoc = {
        $set: {
          likes: like + 1,
        },
      };
      const result = await postsCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    app.patch("/cancleLikes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const selectedPost = await postsCollection.findOne(query);
      const like = selectedPost.likes;
      const updatedDoc = {
        $set: {
          likes: like - 1,
        },
      };
      const result = await postsCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    app.patch("/update/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const body = req.body;
      const updatedDoc = {
        $set: {
          name: body.name,
          address: body.address,
          versity: body.versity,
        },
      };
      const result = await usersCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    // post comments to mongodb database
    app.post("/comments", async (req, res) => {
      let query = req.body;
      var d = new Date();
      var date = d.getDate();
      var month = d.getMonth() + 1;
      var year = d.getFullYear();
      var dateStr = date + "/" + month + "/" + year;
      query.date = dateStr;
      const review = await commentsCollection.insertOne(query);
      res.send(review);
    });

    app.get("/comment/:id", async (req, res) => {
      const id = req.params.id;
      let query = { postId: id };
      const comment = await commentsCollection.find(query).toArray();
      res.send(comment);
    });

    app.post("/users", async (req, res) => {
      const data = req.body;
      const { uid } = data;
      const query = { uid: uid };
      const selectedAccount = await usersCollection.findOne(query);
      if (!selectedAccount) {
        const result = await usersCollection.insertOne(data);
        res.send(result);
      }
    });

    app.get("/user/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });
  } finally {
  }
}
run().catch((error) => console.log(error));

app.listen(port, () => {
  console.log(`e-tutor running on port ${port}`);
});
