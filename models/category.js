var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
  name: { type: String, required: true, minLength: 2, maxLength: 60 },
  description: { type: String, required: true, maxLength: 400 },
});

CategorySchema.virtual("url").get(function () {
  return "/category" + this._id;
});

module.exports = mongoose.model("Category", CategorySchema);
