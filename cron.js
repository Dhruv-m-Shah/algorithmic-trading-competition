const cron = require("node-cron");
var AWS = require("aws-sdk");
const { connect, getCursor, setStandardAndPoors } = require("./dbController");
AWS.config.region = "us-east-1";
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
  region: "us-east-1"
});

var lambda = new AWS.Lambda();

function updateStandardStock(client) {
  try {
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
        setStandardAndPoors(
          client,
          JSON.parse(data.Payload)["standardAndPoors100d"]
        );
      }
    });
  } catch (e) {
      console.log(e);
  }
}

function executeLambdas(client) {
  cron.schedule(
    "00 32 21 * * *",
    async () => {
      // Run cron job everyday at 4:30 EST.
      console.log("RAN");
      updateStandardStock(client);
      const cursor = await getCursor(client);
      await cursor.forEach(async (doc) => {
        for (const submission in doc["submissions"]) {
          vals = doc["submissions"][submission];
          payload = {
            code: vals["code"],
            cash: vals["cash"],
            stocks: vals["stocks"],
            submission_id: submission,
            user_id: doc["_id"]
          };
          console.log(payload);
          var params = {
            FunctionName: "run-code",
            Payload: JSON.stringify(payload),
            InvocationType: "Event",
          };
          lambda.invoke(params, function (err, data) {
            if (err) {
              console.log(err);
            } else {
              console.log(data.Payload);
            }
          });
        }
      });
    },
    {
      scheduled: true,
      timezone: "America/New_York",
    }
  );
}

module.exports = { executeLambdas };
