const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const mongoURI = process.env.MONGODB_URL;

const connect = () => {
    mongoose.connect(mongoURI, ()=> {
        console.log("Connection Successfull.");
    });
}

module.exports = connect;