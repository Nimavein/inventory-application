const { body, validationResult } = require("express-validator");

var Item = require("../models/item");
var Brand = require("../models/brand");
var Category = require("../models/category");

var async = require("async");
const item = require("../models/item");

exports.index = function (req, res) {
  async.parallel(
    {
      item_count: function (callback) {
        Item.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      brand_count: function (callback) {
        Brand.countDocuments({}, callback);
      },

      category_count: function (callback) {
        Category.countDocuments({}, callback);
      },
    },
    function (err, results) {
      res.render("index", {
        title: "Inventory Application",
        error: err,
        data: results,
      });
    }
  );
};

exports.item_list = function (req, res, next) {
  Item.find()
    .populate("brand")
    .populate("category")
    .exec(function (err, list_items) {
      if (err) {
        return next(err);
      }
      //Successful, so render

      res.render("item_list", { title: "Item list", item_list: list_items });
    });
};

// Display detail page for a specific Item.
exports.item_detail = function (req, res, next) {
  async.parallel(
    {
      item: function (callback) {
        Item.findById(req.params.id)
          .populate("brand")
          .populate("category")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.item == null) {
        // No results.
        var err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("item_detail", {
        title: results.item.name,
        item: results.item,
        category: results.item.category,
      });
    }
  );
};

// Display Item create form on GET.
exports.item_create_get = function (req, res, next) {
  async.parallel(
    {
      brands: function (callback) {
        Brand.find(callback);
      },
      categories: function (callback) {
        Category.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("item_form", {
        title: "Create Item",
        brands: results.brands,
        categories: results.categories,
      });
    }
  );
};

// Handle Item create on POST.
exports.item_create_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!(req.body.category instanceof Array)) {
      if (typeof req.body.category === "undefined") req.body.category = [];
      else req.body.category = new Array(req.body.category);
    }
    next();
  },

  // Validate and sanitise fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("brand", "Brand must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty").trim().isLength({ min: 1 }).escape(),
  body("number_in_stock", "Number in Stock must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Item object with escaped and trimmed data.
    var item = new Item({
      name: req.body.name,
      brand: req.body.brand,
      description: req.body.description,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all brands and categories for form.
      async.parallel(
        {
          brands: function (callback) {
            Brand.find(callback);
          },
          categories: function (callback) {
            Category.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }
          // Mark our selected categories as checked.
          for (let i = 0; i < results.categories.length; i++) {
            if (
              item.category.toString().indexOf(results.categories[i]._id) > -1
            ) {
              results.categories[i].checked = "true";
            }
          }
          res.render("item_form", {
            title: "Create Item",
            brands: results.brands,
            categories: results.categories,
            item: item,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Save item.
      item.save(function (err) {
        if (err) {
          return next(err);
        }
        //successful - redirect to new item record.
        res.redirect(item.url);
      });
    }
  },
];

// Display Item delete form on GET.
exports.item_delete_get = function (req, res, next) {
  Item.findById(req.params.id).exec(function (err, item) {
    if (err) {
      return next(err);
    }
    if (item == null) {
      console.log("XD");
      // No results.
      res.redirect("/catalog/items");
    }
    // Successful, so render.
    res.render("item_delete", { title: "Delete Item", item: item });
  });
};

// Handle Item delete on POST.
exports.item_delete_post = function (req, res, next) {
  // Assume valid Item id in field.
  Item.findByIdAndRemove(req.body.id, function deleteItem(err) {
    if (err) {
      return next(err);
    }
    console.log("Success");
    // Success, so redirect to list of Items.
    res.redirect("/catalog/items");
  });
};

// Display Item update form on GET.
exports.item_update_get = function (req, res) {
  res.send("NOT IMPLEMENTED: Item update GET");
};

// Handle Item update on POST.
exports.item_update_post = function (req, res) {
  res.send("NOT IMPLEMENTED: Item update POST");
};
