const { body, validationResult } = require("express-validator");

var Item = require("../models/item");
var Brand = require("../models/brand");
var Category = require("../models/category");

var async = require("async");

// Display list of all Brands.
exports.brand_list = function (req, res, next) {
  Brand.find().exec(function (err, list_brands) {
    if (err) {
      return next(err);
    }
    //Successful, so render
    res.render("brand_list", { title: "Brand list", brand_list: list_brands });
  });
};

// Display detail page for a specific Brand.
exports.brand_detail = function (req, res, next) {
  async.parallel(
    {
      brand: function (callback) {
        console.log("brand_function");
        Brand.findById(req.params.id).exec(callback);
      },

      brand_items: function (callback) {
        console.log("brand_items_function");
        Item.find({ brand: req.params.id })
          .populate("category")
          .populate("brand")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.brand == null) {
        // No results.
        var err = new Error("Brand not found");
        err.status = 404;
        return next(err);
      }
      console.log("succes");
      // Successful, so render
      res.render("brand_detail", {
        title: "Brand Detail",
        brand: results.brand,
        brand_items: results.brand_items,
      });
    }
  );
};

// Display Brand create form on GET.
exports.brand_create_get = function (req, res, next) {
  res.render("brand_form", { title: "Create Brand" });
};

// Handle Brand create on POST.
exports.brand_create_post = [
  // Validate and santize the name field.
  body("name", "Brand name required").trim().isLength({ min: 1 }).escape(),
  body("description", "Brand description required")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a brand object with escaped and trimmed data.
    var brand = new Brand({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("brand_form", {
        title: "Create brand",
        brand: brand,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if brand with same name already exists.
      Brand.findOne({ name: req.body.name }).exec(function (err, found_brand) {
        if (err) {
          return next(err);
        }

        if (found_brand) {
          // brand exists, redirect to its detail page.
          res.redirect(found_brand.url);
        } else {
          brand.save(function (err) {
            if (err) {
              return next(err);
            }
            // brand saved. Redirect to brand detail page.
            res.redirect(brand.url);
          });
        }
      });
    }
  },
];

// Display Brand delete form on GET.
exports.brand_delete_get = function (req, res, next) {
  async.parallel(
    {
      brand: function (callback) {
        Brand.findById(req.params.id).exec(callback);
      },
      brand_items: function (callback) {
        Item.find({ brand: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.brand == null) {
        // No results.
        res.redirect("/catalog/brand");
      }
      // Successful, so render.
      res.render("brand_delete", {
        title: "Delete Brand",
        brand: results.brand,
        brand_items: results.brand_items,
      });
    }
  );
};

// Handle Brand delete on POST.
exports.brand_delete_post = function (req, res, next) {
  async.parallel(
    {
      brand: function (callback) {
        Brand.findById(req.body.brandid).exec(callback);
      },
      brands_books: function (callback) {
        Item.find({ brand: req.body.brandid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.brands_books.length > 0) {
        // brand has items. Render in same way as for GET route.
        res.render("brand_delete", {
          title: "Delete brand",
          brand: results.brand,
          brand_books: results.brands_books,
        });
        return;
      } else {
        // brand has no books. Delete object and redirect to the list of brands.
        Brand.findByIdAndRemove(req.body.brandid, function deleteBrand(err) {
          if (err) {
            return next(err);
          }
          // Success - go to brand list
          res.redirect("/catalog/brands");
        });
      }
    }
  );
};

// Display Brand update form on GET.
exports.brand_update_get = function (req, res) {
  res.send("NOT IMPLEMENTED: Brand update GET");
};

// Handle Brand update on POST.
exports.brand_update_post = function (req, res) {
  res.send("NOT IMPLEMENTED: Brand update POST");
};
