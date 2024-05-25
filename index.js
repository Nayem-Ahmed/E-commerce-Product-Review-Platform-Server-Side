const express = require('express')
var cookieParser = require('cookie-parser')
const app = express()
app.use(cookieParser())
require('dotenv').config()
var jwt = require('jsonwebtoken');
const cors = require('cors')
const port = process.env.PORT || 5000
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
}));
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8wqrrau.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        const allproductsCollection = client.db('E-commerce-Product-Review-Platform').collection('allProducts');
        const reviewCollection = client.db('E-commerce-Product-Review-Platform').collection('userReview');

        // jwt
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.Access_token, { expiresIn: 1 })
            console.log(user);
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                })
                .send({ success: true })
        })
        // Get all products
        // app.get('/allproducts', async (req, res) => {
        //     const { sort } = req.query;
        //     const query = {};
        //     const option = {};

        //     if (sort === 'priceLowToHigh') {
        //         option.sort = { price: 1 };
        //     } else if (sort === 'priceHighToLow') {
        //         option.sort = { price: -1 };
        //     } else if (sort === 'ratingHighLow') {
        //         option.sort = { rating: -1 };
        //     }

        //     try {
        //         const result = await allproductsCollection.find(query, option).toArray();
        //         res.send(result);
        //     } catch (error) {
        //         res.status(500).send({ error: 'Failed to fetch products' });
        //     }
        // });

        app.get('/allproducts', async (req, res) => {
            const filter = req.query;
            const query = {};
            const option = {
                sort: {}
            };

            // Apply sorting based on the filter
            if (filter.sort === 'priceLowToHigh') {
                option.sort.price = 1;
            } else if (filter.sort === 'priceHighToLow') {
                option.sort.price = -1;
            } else if (filter.sort === 'ratingHighLow') {
                option.sort.rating = -1;
            }

            // Apply category filtering if category is provided
            if (filter.category) {
                query.category = filter.category;
            }

            try {
                const result = await allproductsCollection.find(query, option).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to fetch products' });
            }
        });
        // get single product
        app.get('/allproducts/:id', async (req, res) => {
            const id = req.params.id
            const result = await allproductsCollection.findOne({ _id: new ObjectId(id) })
            res.send(result)
        })

        //  Review
        app.post('/review', async (req, res) => {
            const revieww = req.body;
            const result = await reviewCollection.insertOne(revieww);
            res.send(result);
        })

        // Get reviews for a specific product
        app.get('/review', async (req, res) => {
            const reviews = await reviewCollection.find().toArray()
            res.send(reviews);
        });

        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})