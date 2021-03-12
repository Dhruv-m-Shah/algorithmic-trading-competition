const cron = require('node-cron');
var AWS = require('aws-sdk');
const {connect, getCursor} = require('./dbController');
AWS.config.region = 'eu-west-1';
var lambda = new AWS.Lambda();
function executeLambdas(){ 
    cron.schedule('54 00 * * *', async () => { // Run cron job everyday at 4:30 EST.
    client = await connect();
    const cursor = await getCursor(client);
    await cursor.forEach((doc) => {
        console.log(doc);
    });
    lambda.invoke();
    }, {
        scheduled: true,
        timezone: "America/New_York"
    });
}

module.exports = {executeLambdas};