const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();

// middlewares
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.iq3jpr7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    const database = client.db("Craft-DB");
    const craftCollection = database.collection("craft");
    const craftCategoriesCollection = database.collection("craft-categories");

    app.get("/crafts", async (req, res) => {
      const cursor = craftCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/craftsCategory", async (req, res) => {
      const cursor = craftCategoriesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/craft/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await craftCollection.findOne(query);
      res.send(result);
    });

    app.get("/category/:name", async (req, res) => {
      const name = decodeURIComponent(req.params.name);
      const query = {
        subcategory: name,
      };
      const cursor = craftCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/crafts/:email", async (req, res) => {
      const email = req.params.email;
      const customization = req.query.customization;
      const query = {
        user_Email: email,
      };

      if (customization) {
        query.customization = customization;
      }
      const cursor = craftCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/craft", async (req, res) => {
      const craft = req.body;
      const result = await craftCollection.insertOne(craft);
      res.send(result);
    });

    app.put("/craft/:id", async (req, res) => {
      const id = req.params.id;
      const craft = req.body;

      const filter = { _id: new ObjectId(id) };
      const updatedCraft = {
        $set: {
          name: craft.name,
          subcategory: craft.subcategory,
          price: craft.price,
          rating: craft.rating,
          customization: craft.customization,
          processing_time: craft.processing_time,
          stockStatus: craft.stockStatus,
          photo_url: craft.photo_url,
          description: craft.description,
        },
      };
      const result = await craftCollection.updateOne(filter, updatedCraft);
      res.send(result);
    });

    app.delete("/craft/:id", async (req, res) => {
      const id = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await craftCollection.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`server running on port : ${port}`);
});
