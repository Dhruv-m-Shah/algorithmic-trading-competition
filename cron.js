var cron = require('node-cron');


function executeLambdas(){ 
    cron.schedule('30 16 * * *', () => { // Run cron job everyday at 4:30 EST.
    console.log('running a task every minute');
    }, {
        scheduled: true,
        timezone: "America/New_York"
    });
}

module.exports = {executeLambdas};