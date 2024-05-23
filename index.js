const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
}));
app.use(express.json())




const { MongoClient, ServerApiVersion } = require('mongodb');
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

        // Get all users
        // app.get('/allproducts', async (req, res) => {
        //     const filter = req.query;
        //     const query = {};
        //     const option = {
        //         sort: {
        //             price: filter.sort === 'priceLowToHigh' ? 1 : -1
        //         }
        //     }
        //     const result = await allproductsCollection.find(query,option).toArray()
        //     res.send(result)
        // })

        // Get all products
        app.get('/allproducts', async (req, res) => {
            const { sort } = req.query;
            const query = {};
            const option = {};

            if (sort === 'priceLowToHigh') {
                option.sort = { price: 1 };
            } else if (sort === 'priceHighToLow') {
                option.sort = { price: -1 };
            } else if (sort === 'ratingHighLow') {
                option.sort = { rating: -1 };
            }

            try {
                const result = await allproductsCollection.find(query, option).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to fetch products' });
            }
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