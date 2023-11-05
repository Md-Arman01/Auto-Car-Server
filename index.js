const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;



// middleWare
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kplqqe8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const servicesCollection = client.db("auto_car").collection("services");


    app.get('/services', async(req, res) => {
      const cursor = servicesCollection.find()
      const result = await cursor.toArray()
      res.send(result)

    })
    app.get('/services/:id', async(req, res)=> {
      const id = req.params.id;
      const quary = {_id: new ObjectId(id)}
      const result = await servicesCollection.findOne(quary);
      res.send(result)
    })





    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Server Is Runnig')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })