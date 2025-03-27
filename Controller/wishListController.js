import mongoose, { Types } from "mongoose";
import {
  failedResponse,
  internalServerErrorResponse,
  InvalidDataResponse,
  successResponse,
} from "../utils/responseHelper.js";
import wishListModel from "../Model/wishListModel.js";

const wishListController = {
  addToWishList: async (req, res) => {
    try {
      const { user_id, product_id } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(user_id) ||
        !mongoose.Types.ObjectId.isValid(product_id)
      ) {
        return InvalidDataResponse(
          res,
          "Object Id Kindly Please check",
          req.body
        );
      }

      let getWishlist = await wishListModel.findOne({ user_id: user_id });
      if (!getWishlist) {
        getWishlist = await wishListModel.create({
          user_id: user_id,
          products: [],
        });
      }
      const wishlistProduct = getWishlist.products.findIndex(
        (product) => product.product_id.toString() === product_id
      );
      if (wishlistProduct > -1) {
        return InvalidDataResponse(
          res,
          "Product is Already in wishlist",
          req.body
        );
      }
      getWishlist.products.push({ product_id: product_id });

      await getWishlist.save();
      return successResponse(
        res,
        "Product added successfully in Wishlist",
        getWishlist
      );
    } catch (error) {
      internalServerErrorResponse(res, error.message);
    }
  },
  removeToWishList: async (req, res) => {
    try {
      const { user_id, product_id } = req.body;
      if (
        !mongoose.Types.ObjectId.isValid(user_id) ||
        !mongoose.Types.ObjectId.isValid(product_id)
      ) {
        return InvalidDataResponse(
          res,
          "Object Id Kindly Please check",
          req.body
        );
      }

      let getWishlist = await wishListModel.findOne({ user_id: user_id });

      if (!getWishlist) {
        return InvalidDataResponse(res, "Invalid Data Format", req.body);
      }
      if (getWishlist.products.length === 0) {
        return failedResponse(res, "wishlist is empty", user_id);
      }

      const wishlistProduct = getWishlist.products.findIndex(
        (product) => product.product_id.toString() === product_id
      );
      if (wishlistProduct === -1) {
        return InvalidDataResponse(res, "Product is not in wishlist", req.body);
      }
      getWishlist.products.splice(wishlistProduct, 1);
      await getWishlist.save();
      return successResponse(
        res,
        "Product removed successfully in Wishlist",
        getWishlist
      );
    } catch (error) {
      internalServerErrorResponse(res, error.message);
    }
  },
  getWishlistProduct: async (req, res) => {
    const getWishList = await wishListModel.aggregate([
      {
        $match: {
          user_id: Types.ObjectId.createFromHexString(req.user._id),
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product_id",
          foreignField: "_id",
          as: "productField",
        },
      },
      {
        $unwind: {
          path: "$productField",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          user_id: "$user_id",
          products: [
            {
              product_name: "$productField.product_name",
              _id: "$productField._id",
            },
          ],
        },
      },
    ]);
    if (!getWishList) {
      return failedResponse(res, "No card Found", req.user._id);
    }

    if (getWishList[0].products.length === 0) {
      return failedResponse(res, "No product Found In wishlist", []);
    }
    return successResponse(
      res,
      "Wishlist Product Fetched Successfully",
      getWishList
    );
  },
};

export const {
  addToWishList,
  removeToWishList,
  getWishlistProduct,
} = wishListController;
