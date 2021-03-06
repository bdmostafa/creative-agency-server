const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const uploadFile = require('express-fileupload');
require('dotenv').config();
const { ObjectID } = require('mongodb');

const port = 4200;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(uploadFile());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.USER_PASS}@cluster0.efifc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(
    uri,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
);

client.connect(err => {

    const servicesCollection = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION_SERVICES);
    const ordersCollection = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION_ORDERS);
    const reviewsCollection = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION_REVIEWS);
    const adminsCollection = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION_ADMINS);

    // Function to process request data with file system
    const loadRequestedData = (req) => {

        const file = req.files.file;
        const newImg = file.data;
        const encodedImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encodedImg, 'base64')
        };

        const totalData = JSON.parse(req.body.total)
        totalData.img = image;

        return totalData;
    }

    // API for adding new service by admins
    app.post('/addService', (req, res) => {

        const newService = loadRequestedData(req);

        servicesCollection.insertOne(newService)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // API for getting all available services
    app.get('/services', (req, res) => {

        servicesCollection.find({})
            .toArray((err, services) => {
                res.send(services);
            })
    })

    // API for placing order a service by users
    app.post('/placeOrder', (req, res) => {

        const orderedService = loadRequestedData(req);

        ordersCollection.insertOne(orderedService)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // API for getting services list by email both admin or user
    app.post('/ordersListByEmail', (req, res) => {

        const email = req.body.email;

        adminsCollection.find({ email })
            .toArray((err, admins) => {
                if (admins.length === 0) {
                    // If admin email is not found,
                    // find the orderscollections matching only loggedInUser email
                    ordersCollection.find({ email })
                        .toArray((err, myOrders) => {
                            res.send(myOrders)
                        })
                }
                // If admin email is found, load all orders collection
                ordersCollection.find({})
                    .toArray((err, allOrders) => {
                        res.send(allOrders)
                    })
            })
    })

    // API for checking if an user is admin or not
    app.get('/isAdmin', (req, res) => {

        const email = req.headers.email;

        adminsCollection.find({ email })
            .toArray((err, admin) => {
                res.send(admin.length > 0)
            })
    })

    // API for adding a new admin email
    app.post('/makeAdmin', (req, res) => {

        const email = (req.headers.email);

        adminsCollection.insertOne({ email })
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    // API for adding a review by users
    app.post('/addReview', (req, res) => {

        const newReview = req.body;

        reviewsCollection.insertOne(newReview)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    // API for getting all reviews of customers/users
    app.get('/reviews', (req, res) => {

        reviewsCollection.find({})
            .toArray((err, reviews) => {
                // console.log(err, reviews)
                res.send(reviews);
            })
    })

    // API for updating status of an order by admin
    app.patch('/updateStatus', (req, res) => {

        ordersCollection.updateOne({ _id: req.headers.id }, {
            $set: { status: req.body.status }
        })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })
});

app.get('/', (req, res) => {
    res.send('Hello Creative Agency!')
})

app.listen(process.env.PORT || port);





