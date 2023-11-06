const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kplqqe8.mongodb.net/?retryWrites=true&w=majority`;

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
    const servicesCollection = client.db("auto_car").collection("services");
    const bookingCollection = client.db("auto_car").collection("booking");

    app.get("/services", async (req, res) => {
      try{
        const cursor = servicesCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      }
      catch(error){
        console.log(error)
      }
    });
    app.get("/services/:id", async (req, res) => {
      try{
        const id = req.params.id;
        const quary = { _id: new ObjectId(id) };
        const result = await servicesCollection.findOne(quary);
        res.send(result);
      }
      catch(error){
        console.log(error)
      }
    });
    app.post("/booking", async (req, res) => {
      try {
        const booked = req.body;
        const doc = {
          services_img: booked.services_img,
          services_name: booked.services_name,
          provider_email: booked.provider_email,
          user_email: booked.user_email,
          instruction: booked.instruction,
          price: booked.price,
          date: booked.date,
        };
        const result = await bookingCollection.insertOne(doc)
        res.send(result)

      } catch (error) {
        console.log(error);
      }
    });

    // Connect the client to the server	(optional starting in v4.7)
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
  res.send("Server Is Runnig");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
