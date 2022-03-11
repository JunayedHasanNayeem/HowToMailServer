const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const cors = require('cors');
require("dotenv").config()
const request = require('request');
const port = process.env.PORT || 5000;

//MIDDLE WARE
app.use(express.json())
app.use(cors())

//MongoDB Connect
const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.fpc6f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        //Mongo Client
        client.connect()
        const database = client.db('HowToMail')
        const usersCollection = database.collection('users');


        //Post SearchInfo - API
        app.post('/search-result', async (req, res) => {
            const searchInfo = req.body;
            request({
                method: 'GET',
                uri: `https://api.rocketreach.co/v2/api/lookupProfile?api_key=a27bdbk41e980a36862fdbb403b4df6472ef915&name=${searchInfo.profileName}&current_employer=${searchInfo.companyName}`,
            }, function (error, response, body) {
                if (error) {
                    console.log(error);
                    return;
                }
                const data = response.body;
                const apiData = JSON.parse(data)
                res.send(apiData)
            });
        })

        //GET SearchResults - API 
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.send(users)

        });

        // GET USER 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true
            }
            res.json({ admin: isAdmin })
        })

        //POST USER - API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            console.log(result)
        })

        //PUT USER - API
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options)
        })

        //PUT CREDITS - API
        app.put('/users/add-credits', async(req, res) => {
            const credits = req.body;
            const filter = {email: credits.email}
            const user = await usersCollection.findOne({ email: credits.email })
            let currentCredits;
            if(user?.credits){
                currentCredits = parseFloat(user?.credits);
            } else {
                currentCredits = 0
            }
            const updateDoc = await {$set:{credits: parseFloat(credits?.credits) + currentCredits}}
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.send({currentCredits})
        })

    }
    finally {
        //await client.close()
    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send("HowToMail server is running")
})

app.listen(port, () => {
    console.log('Listening to the port:', port)
})