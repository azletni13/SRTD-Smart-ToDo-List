'use strict'

require('dotenv').config({path: '../.env'});

const request = require('request');
const amazon = require('amazon-product-api');

var client = amazon.createClient({
  awsId: process.env.amazonID,
  awsSecret: process.env.amazonSECRET,
  awsTag: process.env.amazonTAG
});

client.itemSearch({
  SearchIndex: "Books",
  Title: "Pizza Pizza"

}, function(err, results, response) {
  if (err) {
    console.log(err);
  } else {
    console.log(results[0].ItemAttributes[0]);  // products (Array of Object)
    // console.log(response); // response (Array where the first element is an Object that contains Request, Item, etc.)
  }
});