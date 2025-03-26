import mongoose, { Types } from "mongoose";
import cartModel from "../Model/CartModel.js";
import {
  checkAllFields,
  failedResponse,
  internalServerErrorResponse,
  InvalidDataResponse,
  successResponse,
} from "../utils/responseHelper.js";

const cartController = {
  addToCart: async (req, res) => {
    try {
      const {
        user_id,
        product_id,
        product_variant_id,
        no_of_product,
        product_selling_price,
      } = req.body;
      const requiredField = [
        "user_id",
        "product_id",
        "product_variant_id",
        "no_of_product",
        "product_selling_price",
      ];
      if (!checkAllFields(req.body, requiredField)) {
        return InvalidDataResponse(
          res,
          "Data Format Kindly Please Check",
          req.body
        );
      }
      let getCart = await cartModel.findOne({ user_id: user_id });
      if (!getCart) {
        await cartModel.create({
          user_id: user_id,
          items: [],
          cart_total: 0,
        });
      }
      
      const itemTotalPrice = no_of_product * product_selling_price;
      const itemIndex = getCart.items.findIndex(
        (item) =>
          item.product_id.toString() === product_id &&
          item.product_variant_id.toString() === product_variant_id
      );
      if (itemIndex > -1) {
        getCart.items[itemIndex].item_total_price += itemTotalPrice;
        getCart.items[itemIndex].no_of_product += no_of_product;
      } else {
        getCart.items.push({
          product_id,
          product_variant_id,
          no_of_product,
          product_selling_price,
          item_total_price: itemTotalPrice,
        });
      }
      getCart.cart_total += itemTotalPrice;
      await getCart.save();
      successResponse(res, "Product Added Successfully", getCart);
    } catch (error) {
      if (error.name === "ValidationError") {
        return InvalidDataResponse(res, "Data Format", req.body, updatedCart);
      }
      return internalServerErrorResponse(res, error.message);
    }
  },
  removeToCart: async (req, res) => {
    try {
      const {
        user_id,
        product_id,
        product_variant_id,
        no_of_product,
        product_selling_price,
      } = req.body;
      const requiredField = [
        "user_id",
        "product_id",
        "product_variant_id",
        "no_of_product",
        "product_selling_price",
      ];
      if (!checkAllFields(req.body, requiredField)) {
        return InvalidDataResponse(
          res,
          "Data Format Kindly Please Check",
          req.body
        );
      }
      let getCart = await cartModel.aggregate([
        {
          $match: {
            user_id: new Types.ObjectId("67de9af86f81b1726d281de0"),
            "items.product_id": new Types.ObjectId("67d5723a11fcd18976411fde"),
            "items.product_variant_id": new Types.ObjectId(
              "67b9bbdffc89573621ecb331"
            ),
          },
        },
      ]);

     const findProductIndex =   getCart[0].items.findIndex((item)=>item.product_variant_id.toString() === product_variant_id )
// if(findProductIndex > -1){
//   getCart[0].items[findProductIndex].item_total_price
// }

    } catch (error) {
      if (error.name === "ValidationError") {
        return InvalidDataResponse(res, "Data Format", req.body, updatedCart);
      }
      return internalServerErrorResponse(res, error.message);
    }
  },
};

export const { addToCart, removeToCart } = cartController;
