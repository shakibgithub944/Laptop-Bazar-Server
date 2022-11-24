const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

// const jwt = require('jsonwebtoken');
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000
const app = express();

app.use(cors())
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ofvswtt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const CategoryCollection = client.db("laptop-bazar").collection("category");
        const ProductCollection = client.db("laptop-bazar").collection("products");

        app.get('/category', async (req, res) => {
            const query = {}
            const result = await CategoryCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/addproduct', async (req, res) => {
            const product = req.body;
            const result = await ProductCollection.insertOne(product);
            res.send(result);
        })
        app.get('/category-product/:name', async (req, res) => {
            const brand = req.params.name;
            console.log(brand);
            const query = {
                category: brand
            }
            const result = await ProductCollection.find(query).toArray();
            res.send(result);

        })

    }
    finally {

    }
}
run().catch(error => console.log(error));


app.get('/', (req, res) => {
    res.send('Laptop-Bazar server is Runninng.....')
})



app.listen(port, () => {
    console.log('Laptop-bazar Server is Runnig on port', port)
})

