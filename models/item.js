var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ItemSchema = new Schema({
  name: { type: String, required: true, minLength: 2, maxLength: 60 },
  description: { type: String, required: true, maxLength: 200 },
  brand: { type: Schema.Types.ObjectId, ref: "Brand", default: "Other" },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Number, required: true, min: 0 },
  number_in_stock: { type: Number, required: true, min: 0 },
});

ItemSchema.virtual("url").get(function () {
  return "/item" + this._id;
});

module.exports = mongoose.model("Item", ItemSchema);
