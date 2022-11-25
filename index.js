const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const userCollection = client.db("laptop-bazar").collection("users");

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

        app.put('/allproduct/reported/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    status: 'reported'
                }
            }
            const result = await ProductCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })

        app.get('/reportedItem', async (req, res) => {
            const query = {}
            const allproduct = await ProductCollection.find(query).toArray();
            const products = allproduct.filter(product => product.status === 'reported')
            res.send(products);
        })

        app.delete('/reportedItem/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ProductCollection.deleteOne(query);
            res.send(result)
        })

        app.get('/category-product/:name', async (req, res) => {
            const brand = req.params.name;
            const query = {
                category: brand
            }
            const result = await ProductCollection.find(query).toArray();
            res.send(result);

        })
        app.get('/alluser', async (req, res) => {
            const query = {}
            const result = await userCollection.find(query).toArray();
            res.send(result);
        })
        // all seller
        app.get('/allseller', async (req, res) => {
            const query = {}
            const allUser = await userCollection.find(query).toArray();
            const seller = allUser.filter(user => user.role === 'Seller')
            res.send(seller);
        })
        app.get('/allbuyers', async (req, res) => {
            const query = {}
            const allUser = await userCollection.find(query).toArray();
            const buyer = allUser.filter(user => user.role === 'Buyer')
            res.send(buyer);
        })

        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result)
        })
        app.get('/allUsers/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' })

        })
        app.get('/allUsers/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ isSeller: user?.role === 'Seller' })

        })
        app.put('/allUsers/verify/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    status: 'verified'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })
        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result)
        })
        app.get('/myproduct', async (req, res) => {
            const email = req.query.email;
            // const decodedEmail = req.decoded.email
            // if (email !== decodedEmail) {
            //     return res.status(401).send('Unathorize access')
            // }
            const query = {
                email: email,
            }
            const products = await ProductCollection.find(query).toArray();
            res.send(products.reverse());
        })
        // is advertise
        app.put('/allproduct/advertise/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    isAdvertise: 'advertise'
                }
            }
            const result = await ProductCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.get('/advertise/product/', async (req, res) => {
            const query = {
                item: 'available',
                isAdvertise: 'advertise'
            }
            

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

