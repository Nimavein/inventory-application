#! /usr/bin/env node

console.log(
  "This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Brand = require("./models/brand");
var Category = require("./models/category");
var Item = require("./models/item");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var brands = [];
var categories = [];
var items = [];

function brandCreate(name, description, cb) {
  var brand = new Brand({ name: name, description: description });

  brand.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Brand: " + brand);
    brands.push(brand);
    cb(null, brand);
  });
}

function categoryCreate(name, description, cb) {
  var category = new Category({ name: name, description: description });

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Category: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function itemCreate(
  name,
  description,
  brand,
  category,
  price,
  number_in_stock,
  cb
) {
  itemdetail = {
    name: name,
    description: description,
    price: price,
    number_in_stock: number_in_stock,
  };
  if (brand != false) itemdetail.brand = brand;
  if (category != false) itemdetail.category = category;

  var item = new Item(itemdetail);
  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Item: " + item);
    items.push(item);
    cb(null, item);
  });
}

function createBrands(cb) {
  async.series(
    [
      function (callback) {
        brandCreate("Nike", "Nike Brand", callback);
      },
      function (callback) {
        brandCreate("Louis Vuitton", "Louis Vuitton Brand", callback);
      },
      function (callback) {
        brandCreate("Adidas", "Adidas Brand", callback);
      },
      function (callback) {
        brandCreate("Gucci", "Gucci Brand", callback);
      },
      function (callback) {
        brandCreate("H&M", "H&M Brand", callback);
      },
      function (callback) {
        brandCreate("Moncler", "Moncler Brand", callback);
      },
      function (callback) {
        brandCreate("Chanel", "Chanel Brand", callback);
      },
    ],
    // optional callback
    cb
  );
}

function createCategories(cb) {
  async.series(
    [
      function (callback) {
        categoryCreate("T-Shirts", "T-Shirts category", callback);
      },
      function (callback) {
        categoryCreate("Jeans", "Jeans category", callback);
      },
      function (callback) {
        categoryCreate("Shoes", "Shoes category", callback);
      },
      function (callback) {
        categoryCreate("Skirts", "Skirts category", callback);
      },
      function (callback) {
        categoryCreate("Blouses", "Blouses category", callback);
      },
    ],
    // optional callback
    cb
  );
}

function createItems(cb) {
  async.parallel(
    [
      function (callback) {
        itemCreate(
          "T-Shirt 1",
          "T-Shirt 1 description",
          brands[0],
          categories[0],
          32,
          3,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Jeans 1",
          "Jeans 1 description",
          brands[2],
          categories[1],
          159,
          4,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Shoes 1",
          "Shoes 1 description",
          brands[0],
          categories[2],
          199,
          10,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Skirt 1",
          "Skirt 1 description",
          brands[1],
          categories[3],
          299,
          5,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Blouse 1",
          "Blouse 1 description",
          brands[5],
          categories[4],
          119,
          11,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "T-Shirt 2",
          "T-Shirt 2 description",
          brands[4],
          categories[0],
          99,
          8,
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [createBrands, createCategories, createItems],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("Items: " + items);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
