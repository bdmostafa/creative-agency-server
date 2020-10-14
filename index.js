const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const uploadFile = require('express-fileupload');
require('dotenv').config();

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

    // This API is used for adding new service by admins
    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const newImg = file.data;
        const encodedImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encodedImg, 'base64')
        };

        const totalData = JSON.parse(req.body.total)
        totalData.image = image;

        servicesCollection.insertOne(totalData)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/services', (req, res) => {
        servicesCollection.find({})
            .toArray((err, services) => {
                // console.log(err, services)
                res.send(services);
            })
    })











    //   client.close();
});



app.get('/', (req, res) => {
    res.send('Hello Creative Agency!')
})

// app.listen(process.env.PORT || port)
app.listen(port)





