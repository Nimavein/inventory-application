const { body, validationResult } = require("express-validator");

var Item = require("../models/item");
var Brand = require("../models/brand");
var Category = require("../models/category");

var async = require("async");

// Display list of all Categories.
exports.category_list = function (req, res, next) {
  Category.find().exec(function (err, list_categories) {
    if (err) {
      return next(err);
    }
    //Successful, so render
    res.render("category_list", {
      title: "Category list",
      category_list: list_categories,
    });
  });
};

// Display detail page for a specific Category.
exports.category_detail = function (req, res, next) {
  async.parallel(
    {
      category: function (callback) {
        console.log("category_function");
        Category.findById(req.params.id).exec(callback);
      },

      category_items: function (callback) {
        console.log("category_items_function");
        Item.find({ category: req.params.id })
          .populate("category")
          .populate("brand")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results.
        var err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }
      console.log("succes");
      // Successful, so render
      res.render("category_detail", {
        title: "Category Detail",
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};

// Display Category create form on GET.
exports.category_create_get = function (req, res, next) {
  res.render("category_form", { title: "Create Category" });
};

// Handle category create on POST.
exports.category_create_post = [
  // Validate and santize the name field.
  body("name", "Category name required").trim().isLength({ min: 1 }).escape(),
  body("description", "Category description required")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data.
    var category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Create category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if category with same name already exists.
      Category.findOne({ name: req.body.name }).exec(function (
        err,
        found_category
      ) {
        if (err) {
          return next(err);
        }

        if (found_category) {
          // category exists, redirect to its detail page.
          res.redirect(found_category.url);
        } else {
          category.save(function (err) {
            if (err) {
              return next(err);
            }
            // category saved. Redirect to category detail page.
            res.redirect(category.url);
          });
        }
      });
    }
  },
];

// Display Category delete form on GET.
exports.category_delete_get = function (req, res) {
  res.send("NOT IMPLEMENTED: Category delete GET");
};

// Handle Category delete on POST.
exports.category_delete_post = function (req, res) {
  res.send("NOT IMPLEMENTED: Category delete POST");
};

// Display Category update form on GET.
exports.category_update_get = function (req, res) {
  res.send("NOT IMPLEMENTED: Category update GET");
};

// Handle Category update on POST.
exports.category_update_post = function (req, res) {
  res.send("NOT IMPLEMENTED: Category update POST");
};
