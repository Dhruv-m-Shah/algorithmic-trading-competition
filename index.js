require('dotenv').config()
const express = require('express')
const bcrypt = require('bcrypt')
const {connect, createUser, getUserByEmail} = require('./dbController');
const bodyParser = require('body-parser')
const cors = require("cors");
const session = require('express-session')

// Connect to mongodb database
let client;

async function getClient(){
  client = await connect();
}
getClient();

var app = express()
app.use(cors());

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json()); 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
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
        console.log(funcRes);
        if(funcRes == "user exists") res.status(400).json({"message": "user exists"});
        else{
          res.status(200).json({
            "message": "registered user"
          })
        }
    } catch (e) {
      res.status(400).json({
        "message": "could not register user"
      });
    }
});

app.post('/login', async function async (req, res) {

})