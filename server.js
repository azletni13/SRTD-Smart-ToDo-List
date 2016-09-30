"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

const pg = require("pg");

const searchAPI   = require('./routes/searchAPI')

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/items", (req, res) => {
  knex.select()
  .from('items').innerJoin('list', 'lists.id', 'items.list_id')
  .where('list_kind', 'MOVIES')
  .then((result) => {
    res.json(result);
  })
});

app.get("/categories", (req, res) => {
  res.render("buttons");
});

app.get("/categories/books", (req, res) => {
  res.render("books_list");
});

app.get("/categories/movies", (req, res) => {
  res.render("movies_list");
});

app.get("/categories/tvshows", (req, res) => {
  res.render("tvshows_list");
});

app.get("/categories/restaurants", (req, res) => {
  res.render("restaurants_list");
});

app.post("/item_names", (req, res) => {

  var todoInput = req.body.text;

  Promise.all([searchAPI.searchRestauraunt(todoInput), searchAPI.searchMovie(todoInput), /*searchAPI.searchTVshow(todoInput),*/ searchAPI.searchBooks(todoInput)]).then(result => {

    result.forEach(function(searchResult){

      var type = Object.keys(searchResult);

      if(type == 'restauraunt'){
        console.log(searchResult.restauraunt + " was sorted into restauraunt")
      }

      if(type == 'movie'){
        console.log(searchResult.movie + " was sorted into movie");
      }
      // if(type === 'tvShow'){
      //   console.log("sorted into tvShow");
      // }
      if(type == 'book'){
        console.log(searchResult.book + " was sorted into book");
      }

    })

    //iterate through result
    //insert each into database AND THEN OR ALSO
    //render response to front end after database is finished
    //

  })

  res.redirect("/");
});


app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
