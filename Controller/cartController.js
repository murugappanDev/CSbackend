import mongoose, { Types } from "mongoose";
import cartModel from "../Model/CartModel.js";
import {
  checkAllFields,
  failedResponse,
  internalServerErrorResponse,
  InvalidDataResponse,
  successResponse,
} from "../utils/responseHelper.js";
import productModel from "../Model/productModel.js";

const cartController = {
  addToCart: async (req, res) => {
    try {
      const user_id = req.user._id;
      const {
        product_id,
        product_variant_id,
        no_of_product,
        product_selling_price,
        is_available,
      } = req.body;
      const requiredField = [
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
      console.log(getCart);

      if (!getCart) {
        getCart = await cartModel.create({
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
          is_available: is_available,
        });
      }
      getCart.cart_total = getCart.items.reduce(
        (sum, item) => sum + item.item_total_price,
        0
      );
      await getCart.save();
      successResponse(res, "Product Added Successfully", getCart);
    } catch (error) {
      if (error.name === "ValidationError") {
        return InvalidDataResponse(res, "Data Format", req.body);
      }
      return internalServerErrorResponse(res, error.message);
    }
  },
  removeToCart: async (req, res) => {
    const user_id = req.user._id;
    try {
      const {
        product_id,
        product_variant_id,
        no_of_product,
        product_selling_price,
      } = req.body;
      const requiredField = [
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

      let getCart = await cartModel.findOne({
        user_id: Types.ObjectId.createFromHexString(user_id),
        items: {
          $elemMatch: {
            product_id: Types.ObjectId.createFromHexString(product_id),
            product_variant_id: Types.ObjectId.createFromHexString(
              product_variant_id
            ),
          },
        },
      });
      console.log(getCart);
      if (!getCart) {
        return failedResponse(res, "Cannot Find product", req.body);
      }

      const findProductIndex = getCart.items.findIndex(
        (item) => item.product_variant_id.toString() === product_variant_id
      );

      if (findProductIndex === -1) {
        return failedResponse(res, "Product Not Found In Cart", req.body);
      }
      let cartItem = getCart.items[findProductIndex];
      if (cartItem.no_of_product < no_of_product) {
        return failedResponse(
          res,
          "Cannot remove more than products in a cart",
          no_of_product
        );
      }
      cartItem.no_of_product -= no_of_product;

      cartItem.item_total_price = Math.max(
        0,
        cartItem.item_total_price - product_selling_price
      );
      if (cartItem.no_of_product === 0) {
        getCart.items.splice(findProductIndex, 1);
      }
      if (getCart.items.length === 0) {
        getCart.cart_total = 0;
      }
      getCart.cart_total = Math.max(
        0,
        getCart.cart_total - product_selling_price
      );

      await getCart.save();
      successResponse(res, "Product removed Successfully", getCart);
    } catch (error) {
      if (error.name === "ValidationError") {
        return InvalidDataResponse(res, "Data Format", req.body, updatedCart);
      }
      return internalServerErrorResponse(res, error.message);
    }
  },
  getCart: async (req, res) => {
    try {
      const user_id = req.user._id;
      let getCart = await cartModel.find({ user_id: user_id });

      if (getCart.length === 0) {
        return failedResponse(res, "Failed to fetch data", []);
      }
      if (getCart[0].items.length === 0) {
        return successResponse(
          res,
          "No data Found In Cart. Please add something to the cart.",
          []
        );
      }

      const ExistingProduct = getCart[0].items.map(
        (products) => products.product_variant_id
      );
      let product = await productModel.find({
        "items._id": { $in: ExistingProduct },
      });

      const data = [];
      product.forEach((prod) => prod.items.forEach((Qty) => data.push(Qty)));

      const filteredData = data.filter((items) =>
        ExistingProduct.map((id) => id.toString()).includes(
          items._id.toString()
        )
      );
      getCart[0].items = getCart[0].items.map((cartItem) => {
        const matchingProduct = filteredData.find(
          (product) =>
            product._id.toString() === cartItem.product_variant_id.toString()
        );
        if (matchingProduct) {
          cartItem.product_selling_price = matchingProduct.selling_price;
          cartItem.item_total_price =
            cartItem.no_of_product * cartItem.product_selling_price;
          cartItem.is_available = matchingProduct.is_available;
        }
        return cartItem;
      });
      getCart[0].cart_total = getCart[0].items.reduce(
        (sum, item) => sum + item.item_total_price,
        0
      );
      await getCart[0].save();

      return successResponse(res, "Cart Data Fetched", getCart);
    } catch (error) {
      console.log(error);
      return internalServerErrorResponse(res, error.message);
    }
  },
};

export const { addToCart, removeToCart, getCart } = cartController;
