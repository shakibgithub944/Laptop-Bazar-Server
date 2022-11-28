const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000
const app = express();
app.use(cors())
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ofvswtt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Unathorize access')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send('Request forbidden')
        }
        req.decoded = decoded;
        next()
    })
}

async function run() {
    try {
        const CategoryCollection = client.db("laptop-bazar").collection("category");
        const ProductCollection = client.db("laptop-bazar").collection("products");
        const userCollection = client.db("laptop-bazar").collection("users");
        const bookingsProductCollection = client.db("laptop-bazar").collection("bookedProduct");
        const paymetnsCollection = client.db("laptop-bazar").collection("payments");

        // verify admin 
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = {
                email: decodedEmail,
            }
            const user = await userCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'Request Forbidden' })
            }
            next()
        }

        app.get('/category', async (req, res) => {
            const query = {}
            const result = await CategoryCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/addproduct', verifyJwt, async (req, res) => {
            const product = req.body;
            const result = await ProductCollection.insertOne(product);
            res.send(result);
        })

        app.get('/toshoping', async (req, res) => {
            const query = {}
            const result = await ProductCollection.find(query).toArray();
            res.send(result)
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

        app.get('/reportedItem', verifyJwt, verifyAdmin, async (req, res) => {
            const query = {}
            const allproduct = await ProductCollection.find(query).toArray();
            const products = allproduct.filter(product => product.status === 'reported')
            res.send(products);
        })

        app.delete('/reportedItem/:id', verifyJwt, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ProductCollection.deleteOne(query);
            res.send(result)
        })

        app.get('/category-product/:name', async (req, res) => {
            const brand = req.params.name;
            const query = {
                category: brand,
                item: 'available',
                paid: false
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
        app.get('/allseller', verifyJwt, verifyAdmin, async (req, res) => {
            const query = {}
            const allUser = await userCollection.find(query).toArray();
            const seller = allUser.filter(user => user.role === 'Seller')
            res.send(seller);
        })
        app.get('/allbuyers', verifyJwt, verifyAdmin, async (req, res) => {
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
        app.put('/user/login', async (req, res) => {
            const user = req.body;
            const email = user.email
            const name = user.name
            const role = user.role
            const query = { email }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    email: email,
                    name: name,
                    role: role
                }
            }

            const result = await userCollection.updateOne(query, updatedDoc, options);
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
        app.delete('/user/:id', verifyJwt, verifyAdmin, async (req, res) => {
            const id = req.params.id
            console.log(id);
            const query = { _id: ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result)
        })
        app.get('/myproduct', verifyJwt, async (req, res) => {
            const email = req.query.email;
            const query = {
                email: email,
            }
            const products = await ProductCollection.find(query).toArray();
            res.send(products.reverse());
        })
        // is advertise
        app.put('/allproduct/advertise/:id', verifyJwt, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    isAdvertise: 'advertise',
                    item: 'available',
                    paid: false
                }
            }
            const result = await ProductCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
        app.get('/advertise/product', async (req, res) => {
            const query = {
                item: 'available',
                isAdvertise: 'advertise'
            }
            const result = await ProductCollection.find(query).toArray();
            res.send(result);
        })
        app.post('/booking/product', verifyJwt, async (req, res) => {
            const product = req.body;
            const result = await bookingsProductCollection.insertOne(product);
            res.send(result)
        })
        app.get('/booked/product/:email', async (req, res) => {
            const email = req.params.email;
            const query = {
                email
            }
            const result = await bookingsProductCollection.find(query).toArray();
            res.send(result.reverse())
        })
        app.get('/booked/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await bookingsProductCollection.findOne(filter);
            res.send(result)
        })
        // payment intent
        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body
            const price = parseInt(booking.price)
            const amount = price * 100
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ],
            })
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        })

        app.post('/payment', async (req, res) => {
            const booking = req.body
            const result = await paymetnsCollection.insertOne(booking);
            const id = booking.bookingId
            const productId = booking.productId
            const query = { _id: ObjectId(id) }
            const filter = { _id: ObjectId(productId) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    paid: true,
                    item: 'sold'
                }
            }
            const updatedResult = await ProductCollection.updateOne(filter, updatedDoc, options)
            const updatedBookedProduct = await bookingsProductCollection.updateOne(query, updatedDoc, options)
            res.send(result)
        })

        // jwt generator
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            // const query = { email: email }
            // const user = await userCollection.findOne(query);
            if (email) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '7d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accesstoken: 'Request Forbidden' })
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

