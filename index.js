require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const {
  connect,
  createUser,
  getUserByEmail,
  createNewSubmission,
  getSubmissions,
  getStandardAndPoors,
  saveCode,
  saveSubmission,
  updateTransactionHistory,
  deleteSubmission
} = require("./dbController");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const redis = require("redis");
const redisClient = redis.createClient();
const redisStore = require("connect-redis")(session);
const { executeLambdas } = require("./cron");
// Connect to mongodb database
let client;

async function getClient() {
  client = await connect();
  executeLambdas(client);
}
getClient();

var app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hour
    },
    store: new redisStore({
      host: "localhost",
      port: 6379,
      client: redisClient,
      ttl: 60 * 60,
    }), // 1 hour
  })
);

// Initialize the app.
var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});

app.post("/register", async function async(req, res) {
  try {
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    funcRes = await createUser(
      client,
      req.body.email,
      hashPassword,
      req.body.name
    );
    if (funcRes == "user exists")
      res.status(400).json({ message: "user exists" });
    else {
      res.status(200).json({
        message: "registered user",
      });
    }
  } catch (e) {
    res.status(500).json({
      message: "server error",
    });
  }
});

app.post("/login", async function async(req, res) {
  try {
    user = await getUserByEmail(client, req.body.email);
    if (!user) {
      res.status(404).json({ message: "incorrect email or password" });
      return;
    }
    result = await bcrypt.compare(req.body.password, user.hashPassword);
    if (!result) {
      res.status(404).json({ message: "incorrect email or password" });
      return;
    }
    const sess = req.session;
    const email = req.body.email;
    console.log(email);
    console.log(user._id);
    sess.id = user._id;
    sess.email = email;
    res.status(200).json({
      message: "logged in",
    });
  } catch (e) {
    res.status(500).json({
      message: "server error",
    });
  }
});

app.post('/updateUserPortfolio', async function (req, res) {
  try{
    console.log(req.body)
    let portfolioValue = req.body.cash;
    for(let key in req.body.portfolio){ 
      portfolioValue += req.body.portfolio[key][0]*req.body.portfolio[key][1];
    }
    let date = new Date();
    updateTransactionHistory(client, req.body.user_id, req.body.submission_id, 
      portfolioValue, date.toISOString().substr(0, 10));
  } catch(e) {
    console.log(e);
  }
})

app.use((req, res, next) => {
  if (!req.session || !req.session.email) {
    res.status(404).json({
      message: "loggin first.",
    });
    return;
  }
  next();
});

// All routes after this will be executed only if user is logged in.
app.post("/newSubmission", async function (req, res) {
  try {
    const submissionId = await createNewSubmission(client, req.session.id);
    console.log(submissionId);
    res.status(200).json({
      message: "created new submission",
      submissionId: submissionId,
    });
  } catch (e) {}
});

app.get("/getSubmissions", async function (req, res) {
  try {
    submissionData = await getSubmissions(client, req.session.email);
    res.status(200).json({
      submissions: submissionData,
      message: "retrieved submissions",
    });
  } catch (e) {
    res.status(500).json({
      submissions: null,
      message: "could not retrieve data",
    });
  }
});

// returns last 100 submissions in the s&p 500 index.
app.get("/standardAndPoors500", async function (req, res) {
  try{
    sAndPData = await getStandardAndPoors(client);
    res.status(200).json({
      sAndPData: sAndPData,
      message: "got standard and poors data"
    });
  } catch (e) {
    console.log(e);
  }
});

// Creates a new user submission
app.post("/createNewSubmission", async function(req, res) {
  try{
    let submissionId = await createNewSubmission(client, req.session.email, req.body.name);
    res.status(200).json({
      message: "successfully created new submission",
      submissionId: submissionId
    });
  } catch (e) {
    res.status(500).json({
      message: "could not create new submission"
    });
  }
});

// Saved user code
app.post("/saveCode", async function(req, res) {
  try{
    await saveCode(client, req.session.email, req.body.code, req.body.submissionId);
    res.status(200).json({
      message: "successfully saved code"
    });
  } catch (e) {
    res.status(500).json({
      message: "could not save code"
    });
  }
});

app.post("/save", async function(req, res) {
  try{
    await saveSubmission(client, req.session.email, req.body.code, req.body.submissionName, req.body.submissionId);
    res.status(200).json({
      message: "successfully saved submission"
    });
  } catch(e) {
    res.status(500).json({
      message: "could not save submission"
    })
  }
});

app.post("/deleteSubmission", async function (req, res) {
  try{
    await deleteSubmission(client, req.session.email, req.body.submissionId);
    res.status(200).json({
      message: "successfully delete submission"
    });
  } catch(e) {
    console.log(e);
    res.status(500).json({
      message: "could not delete submission"
    });
  }
});