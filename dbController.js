const { MongoClient } = require('mongodb');

async function connect(){
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = `mongodb+srv://db_user_read_write:${process.env.DB_PASSWORD}@cluster0.ob8gc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        return client;
    } catch (e) {
        console.error(e);
    }
}

async function createUser(client, email, hashPassword, name) {
    try{
        var db = client.db("algorithmic_trading").collection("users");
        var isExistingUser = await db.findOne({email: email});
        if(isExistingUser) return "user exists";
        var res = await db.insertOne({email: email, hashPassword: hashPassword, name: name});
    } catch (e) {
        throw e;
    }
}

async function getUserByEmail(client, email){
    try{
        var db = client.db("algorithmic_trading").collection("users");
        var isExistingUser = await db.findOne({email: email});
        return isExistingUser;
    } catch(e){
        return null;
    }
}

module.exports = {connect, createUser, getUserByEmail};