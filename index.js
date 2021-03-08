require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const {connect, createUser, getUserByEmail} = require('./dbController');
const bodyParser = require('body-parser');
const cors = require("cors");
const session = require('express-session');
const redis = require("redis");
const redisClient = redis.createClient();
const redisStore = require('connect-redis')(session);

// Connect to mongodb database
let client;

async function getClient(){
  client = await connect();
}
getClient();

var app = express();
app.use(cors());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(express.json()); 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000*10 // 10 seconds
  },
  store: new redisStore({host: 'localhost', port:6379, client: redisClient, ttl: 10}) // 10 seconds
}));

// Initialize the app.
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});

app.post("/register", async function async (req, res) {
    try {
        const hashPassword = await bcrypt.hash(req.body.password, 10);
        funcRes = await createUser(client, req.body.email, hashPassword, req.body.name);
        if(funcRes == "user exists") res.status(400).json({"message": "user exists"});
        else{
          res.status(200).json({
            "message": "registered user"
          })
        }
    } catch (e) {
      res.status(500).json({
        "message": "server error"
      });
    }
});

app.post('/login', async function async (req, res) {
  try{
    user = await getUserByEmail(client, req.body.email);
    if(!user){
      res.status(404).json({"message": "incorrect email or password"});
      return;
    }
    result = await bcrypt.compare(req.body.password, user.hashPassword);
    if(!result){
      res.status(404).json({"message": "incorrect email or password"});
      return;
    }
    const sess = req.session;
    const email = req.body;
    sess.email = email;
    res.status(200).json({
      "message": "logged in"
    });
  } catch (e) {
    res.status(500).json({
      "message": "server error"
    });
  }
});

app.use((req, res, next) => {
  if(!req.session || req.session.email){
    res.status(404).json({
      "message": "loggin first."
    });
    return;
  }
  next();
});

// All routes after this will be executed only if user is logged in.
