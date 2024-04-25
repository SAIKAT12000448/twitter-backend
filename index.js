
require('dotenv').config();
const {createServer} = require('http');//1
const express = require('express');
const {Server} = require('socket.io');//2
// const httpServer = require('http');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const httpServer = createServer();

const cors = require('cors');


const io = new Server(httpServer,{
  cors:{
    origin:"http://localhost:3000",
    methods:["GET","POST"],
    credentials:true
  }
});
app.use(express.static("/public"));
app.use(cors());
app.use(express.json());   



io.on('connection',(socket)=>{
  console.log('user-connected',socket.id);

  socket.on('message',({room,message})=>{
    console.log({room,message});
    //Message from client to server
    io.to(room).emit('receive-message', message);

  });

  socket.on('disconnect',()=>{
    console.log('user has left!!')
  })      
})


// const uri = `mongodb+srv://aminul:bYI83voIdlRWk6cK@cluster0.lrc63.mongodb.net/?retryWrites=true&w=majority`;
const uri = "mongodb+srv://aminul:bYI83voIdlRWk6cK@cluster0.eakgwz8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

console.log(uri);

// const uri = `mongodb+srv://redux:dgLiilEsKKV1g2tw@cluster0.lrc63.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
// console.log(uri);
const run = async () => {
  try {
    const db = client.db('SkillConnect');
    const usersCollection = db.collection('users');
    const tweetsCollections = db.collection('tweetFeed'); 



    app.post('/tweets',async(req,res)=>{
      const feed = req.body;
      const result = await tweetsCollections.insertOne(feed);
      console.log(result);
      res.send(result);
  })

  app.get('/feed',async (req, res) => {
    const cursor = tweetsCollections.find({});
    const result = await cursor.toArray();
    res.send({data:result});
  })

    app.post('/signup', async (req, res) => {
        
        const users = req.body;

        // console.log(users);
        const result = await usersCollection.insertOne(users);
  
        res.send(result);
      });
    
  
    
    app.get('/users',async (req,res)=>{
      const cursor =usersCollection.find({});
      const result=await cursor.toArray();
      res.send({data:result});      
    })
    
    app.get('/user', async (req, res) => {
      const email = req.params.email;

      const result = await usersCollection.findOne({});
      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });


  } finally {
  }
};

run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

httpServer.listen(4000, () => {
  console.log(`Example app listening on port ${4000}`);
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
