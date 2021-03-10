const cron = require('node-cron');
var AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';
var lambda = new AWS.Lambda();


function executeLambdas(){ 
    cron.schedule('30 16 * * *', () => { // Run cron job everyday at 4:30 EST.
    console.log("Running cron job");
    // TODO: fill invoke params.
    lambda.invoke();
    }, {
        scheduled: true,
        timezone: "America/New_York"
    });
}

module.exports = {executeLambdas};