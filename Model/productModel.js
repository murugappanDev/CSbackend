import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      title: { type: String, trim: true },
      content: { type: String },
      ingredients: { type: String },
      how_to_use: { type: String },
      special: { type: String },
    },
    items: [
      {
        quantity: {
          type: String,
          required: true,
          enum: [
            "50gm",
            "100gm",
            "200gm",
            "250gm",
            "500gm",
            "1kg",
            "2kg",
            "5kg",
          ],
        },
        actual_price: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        selling_price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        is_available: { type: Boolean, default: true },
      },
    ],
    category: {
      type: String,
      required: true,
      enum: ["Spices", "Pickle", "Traditional Rice", "Podi", "Snacks"],
    },
    image: [
      {
        url: { type: String, required: true },
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const productModel = mongoose.model("Product", productSchema);
export default productModel;
