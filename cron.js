const cron = require("node-cron");
var AWS = require("aws-sdk");
const { connect, getCursor } = require("./dbController");
AWS.config.region = "us-east-1";
var lambda = new AWS.Lambda();

function updateStandardStock() {
  payload = {
    updateStandardStock: true,
  };

  // TODO: figure out if I should get rid of RequestReponse.
  var params = {
    FunctionName: "run-code",
    Payload: JSON.stringify(payload),
    InvocationType: "RequestResponse",
  };
  lambda.invoke(params, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log(data.Payload);
    }
  });
}

function executeLambdas(){ 
    cron.schedule('00 49 01 * * *', async () => { // Run cron job everyday at 4:30 EST.
    updateStandardStock();
    client = await connect();
    const cursor = await getCursor(client);
    await cursor.forEach(async (doc) => {
        console.log(doc);
        for(const submission in doc["submissions"]){
            vals = doc["submissions"][submission];
            payload = {
                "code": vals["code"],
                "cash": vals["cash"],
                "stocks": vals["stocks"]
            };
            var params = {
                FunctionName: "run-code", 
                Payload: JSON.stringify(payload), 
                InvocationType: "RequestResponse"
            };
            lambda.invoke(params, function(err, data) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(data.Payload);
                }
              });
        }
    });
    
    }, {
        scheduled: true,
        timezone: "America/New_York"
    });
}

module.exports = { executeLambdas };
