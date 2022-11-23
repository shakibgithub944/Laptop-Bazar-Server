const express = require('express');
const cors = require('cors');

// const { MongoClient, ServerApiVersion, ObjectId, ObjectID } = require('mongodb');
// const jwt = require('jsonwebtoken');
// require('dotenv').config()
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000
const app = express();

app.use(cors())
app.use(express.json());



app.get('/', (req, res) => {
    res.send('Laptop-Bazar server is Runninng.....')
})



app.listen(port, () => {
    console.log('Laptop-bazar Server is Runnig on port', port)
})

