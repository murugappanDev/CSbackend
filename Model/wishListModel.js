import mongoose from "mongoose";

const wishListSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
  products: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
    },
  ],
});

const wishListModel = mongoose.model("WishList", wishListSchema);

export default wishListModel;
