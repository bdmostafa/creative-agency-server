const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
const uploadFile = require('express-fileupload');
require('dotenv').config();
const fs = require('fs-extra');

const port = 4200;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(uploadFile());
app.use(express.static('doctors'));


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
  
  











//   client.close();
});



app.get('/', (req, res) => {
    res.send('Hello Creative Agency!')
})

// app.listen(process.env.PORT || port)
app.listen(port)





