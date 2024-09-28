const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const mongoURI = process.env.MONGODB_URL;

const connect = () => {
    mongoose.set("strictQuery", false);
    mongoose.connect(mongoURI, ()=> {
        console.log("Connection Successful.");
    });
}

module.exports = connect;