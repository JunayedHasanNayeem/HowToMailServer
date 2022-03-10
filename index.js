const express = require('express');
const app = express();
const cors = require('cors');
require("dotenv").config()
const request = require('request');
const port = process.env.PORT || 5000;

//MIDDLE WARE
app.use(express.json())
app.use(cors())

async function run() {
    try {

        //Post SearchInfo - API
        app.post('/search-result', async(req, res) => {
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
        app.get('/results', async (req, res) => {
           
        });

        //Post SearchInfo API





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