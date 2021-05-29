var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BrandSchema = new Schema({
  name: { type: String, required: true, minLength: 2, maxLength: 60 },
  description: { type: String, required: true, maxLength: 400 },
});

BrandSchema.virtual("url").get(function () {
  return "/catalog/brand/" + this._id;
});

module.exports = mongoose.model("Brand", BrandSchema);
