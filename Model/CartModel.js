import mongoose from "mongoose";
const cartItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Product",
  },

  product_variant_id: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  no_of_product: {
    type: Number,
    required: true,
    min: 1,
  },
  product_selling_price: {
    type: Number,
    required: true,
  },

  item_total_price: {
    type: Number,
    required: true,
  },
  is_available: {
    type: Boolean,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: [cartItemSchema],
    cart_total: { type: Number, required: true, default: 0 },
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt fields
);

const cartModel = mongoose.model("Cart", cartSchema);
export default cartModel;
