const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ObjectId } = require('mongodb');
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// MongoDB configuration
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1); // Exit the process with a non-zero status code indicating failure
  }
}

connectToMongoDB();

// Create a collection of documents
const bookCollections = client.db("BookInventory").collection("books");

// Insert a book to the database
app.post("/upload-book", async (req, res) => {
  try {
    const data = req.body;
    const result = await bookCollections.insertOne(data);
    res.send(result);
  } catch (error) {
    console.error("Failed to upload book:", error);
    res.status(500).send("Failed to upload book");
  }
});

// Update a book data
app.patch("/book/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updateBookData = req.body;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: { ...updateBookData }
    };
    const result = await bookCollections.updateOne(filter, updateDoc);
    res.send(result);
  } catch (error) {
    console.error("Failed to update book:", error);
    res.status(500).send("Failed to update book");
  }
});

// Delete book data
app.delete("/book/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await bookCollections.deleteOne(filter);
    res.send(result);
  } catch (error) {
    console.error("Failed to delete book:", error);
    res.status(500).send("Failed to delete book");
  }
});

// Find books by category
app.get("/all-books", async (req, res) => {
  try {
    let query = {};
    if (req.query?.category) {
      query = { category: req.query.category };
    }
    const result = await bookCollections.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error("Failed to fetch books:", error);
    res.status(500).send("Failed to fetch books");
  }
});

// Get single book data
app.get('/book/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await bookCollections.findOne(filter);
    res.send(result);
  } catch (error) {
    console.error("Failed to fetch book:", error);
    res.status(500).send("Failed to fetch book");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
