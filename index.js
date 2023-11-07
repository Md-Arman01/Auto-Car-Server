const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
var jwt = require('jsonwebtoken')
var cookieParser = require('cookie-parser')
const app = express();
const port = process.env.PORT || 5000;

// middleWare
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))
app.use(express.json());
app.use(cookieParser())


// custom middleware
const verifyToken = async(req, res, next) => {
  const token = req.cookies.token;
  console.log('tttt token 22', token)
  if(!token){
   return res.status(401).send({message: "unauthorized 24"})
 }
 jwt.verify(token, process.env.ACCESS_SECRET_TOKEN , (err, decoded)=> {
   if(err){
     console.log(err, "28")
     return res.status(401).send({message: "unAuthorized 29"})
     }
     console.log('value in the token', decoded)
     req.user = decoded
     next()
 });

}



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

    // Auth cookies token API
    app.post('/jwt', async(req, res)=> {
      const user = req.body;
      console.log(user)
      const token = jwt.sign(user , process.env.ACCESS_SECRET_TOKEN , { expiresIn: '1h' });
      
      res
      .cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
      .send({success: true})
    })


    //-----------





    // server API

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
  

    app.get('/services1/:email',  async(req, res) => {

      try{
      const email = req.params.email;
      const query = {provider_email: email}
      const result = await servicesCollection.find(query).toArray()
      res.send(result)

      }
      catch(error){
        console.log(error)
      }
    })


    app.get('/booking/:email', verifyToken, async(req, res) => {

      try{
        if(req.params.email !== req.user.email){
          return res.status(403).send({message: 'forbidden access 122'})
      }
      const email = req.params.email;
      const query = {user_email: email}
      const result = await bookingCollection.find(query).toArray()
      res.send(result)

      }
      catch(error){
        console.log(error)
      }
    })

    app.get('/booking1/:email', verifyToken, async(req, res) => {

      try{
        if(req.params.email !== req.user.email){
          return res.status(403).send({message: 'forbidden access 122'})
      }
      const email = req.params.email;
      const query = {provider_email: email}
      const result = await bookingCollection.find(query).toArray()
      res.send(result)
      }
      catch(error){
        console.log(error)
      }
    })


    app.post("/booking", async (req, res) => {
      try {
        const booked = req.body;
        const doc = {
          services_img: booked.services_img,
          services_name: booked.services_name,
          provider_email: booked.provider_email,
          provider_img: booked.provider_img,
          provider_name: booked.provider_name,
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
    
    app.post('/services', async(req, res)=>{
      try{
        const service = req.body;
        const doc = {
               services_img: service.services_img ,               
               services_name: service.services_name ,               
               services_description: service.services_description ,               
               provider_img: service.provider_img ,               
               provider_name: service.provider_name ,               
               location: service.location ,               
               price: service.price ,               
               provider_email: service.provider_email
        }
        const result = await servicesCollection.insertOne(doc)
        res.send(result)
      }
      catch(error){
        console.log(error)
      }
    })
    
    app.put('/services/:id', async(req, res)=> {
      try{
        const updateService = req.body;
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) } 
        const options = { upsert: true }
        const updateDoc = {
          $set: {
                 services_img: updateService.services_img,               
                 services_name: updateService.services_name,               
                 services_description: updateService.services_description,               
                 location: updateService.location,               
                 price: updateService.price
          },
        };
        const result = await servicesCollection.updateOne(filter, updateDoc, options);
        res.send(result);

      }
      catch(error){
        console.log(error)
      }
    })

    app.patch('/booking/:id', async(req,res)=> {
      try{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const updated = req.body;
        const updatedDoc = {
          $set: {
            status: updated.status,
          }
        }
        const result = await bookingCollection.updateOne(filter,updatedDoc)
        res.send(result)
      }catch(error){
        console.log(error)
      }
    })


    app.delete('/services/:id', async(req, res)=> {
      try{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await servicesCollection.deleteOne(query)
        res.send(result)
      }
      catch(error){
        console.log(error)
      }
    })





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
