'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 5000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({
    extended: true
}));
// Specify a directory for static resources
app.use(express.static('public'));
// define our method-override reference
app.use(methodOverride('_method'));
// Set the view engine for server-side templating
app.set('view engine', 'ejs')
// Use app cors
app.use(cors());

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

// app routes here
// -- WRITE YOUR ROUTES HERE --
app.get('/', homePage);
app.post('/', saveSimp);
app.get('/favorite-quotes', getFavPage);
app.get('/favorite-quotes/:quote_id', renderDetails);
app.delete('/favorite-quotes/:quote_id', handleDelete);
app.put('/favorite-quotes/:quote_id', handleEdit);

// callback functions
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --
function homePage(req, res) {
    const url = 'https://thesimpsonsquoteapi.glitch.me/quotes?count=10';
    superagent.get(url).set('User-Agent', 'omar').then(data => {
        const retData = data.body;
        res.render('home', {
            retData
        });
    });
}

function saveSimp(req, res) {
    const {
        char,
        quote,
        img,
        dir
    } = req.body;
    let values = [quote, char, img, dir];
    const SQL = "INSERT INTO simpson (quote,character,image,characterDirection) values ($1,$2,$3,$4) returning *;";
    client.query(SQL, values).then(res.redirect('/favorite-quotes'));
}

function getFavPage(req, res) {
    let SQL = "SELECT * FROM simpson;";
    client.query(SQL).then(data => {
        const collection = data.rows;
        res.render('fav', {
            collection
        });
    });
}

function renderDetails(req, res) {
    const {
        quote_id
    } = req.params;
    let SQL = "SELECT * FROM simpson WHERE id=$1;";
    client.query(SQL, [quote_id]).then(data => {
        const rendData = data.rows;
        res.render('detail', {
            rendData
        });
    });
}

function handleEdit(req, res) {
    const id = req.params.quote_id;
    const newQuote = req.body.newQuote;
    const SQL = "UPDATE simpson SET quote=$1 WHERE id=$2 RETURNING * ;";
    client.query(SQL, [newQuote, id]).then(data => {
        res.redirect('/favorite-quotes');
    });
}

function handleDelete(req, res) {
    const id = req.params.quote_id;
    const SQL = "DELETE FROM simpson where id=$1 returning *;";
    client.query(SQL, [id]).then(data => {
        console.log(data.rowCount);
        res.redirect('/favorite-quotes')
    });
}
// helper functions

// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);