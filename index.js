const connect = require('./db.js');
const path = require('path');
const express = require('express');
require('dotenv').config();
var cors = require('cors');

connect();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors())
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "/public")));
}

// Available Routes.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(port, () => {
    console.log(`Listening at ${port}`);
});