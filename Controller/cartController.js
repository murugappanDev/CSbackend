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
        return InvalidDataResponse(res, "Data Format", req.body, req.body);
      }
      return internalServerErrorResponse(res, error.message);
    }
  },
  getCart: async (req, res) => {
    try {
      const user_id = req.user._id;
      let getCart = await cartModel.aggregate([
        {
          $match: {
            user_id: new mongoose.Types.ObjectId(user_id),
          },
        },
        { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } }, // Unwind items, keep empty carts
        {
          $lookup: {
            from: "products",
            localField: "items.product_id",
            foreignField: "_id",
            as: "productREF",
          },
        },
        {
          $unwind: { path: "$productREF", preserveNullAndEmptyArrays: true }, // Unwind productREF, keep items without products
        },
        {
          $addFields: {
            matchedVariant: {
              $filter: {
                input: "$productREF.items",
                as: "variant",
                cond: { $eq: ["$$variant._id", "$items.product_variant_id"] },
              },
            },
          },
        },
        {
          $unwind: {
            path: "$matchedVariant",
            preserveNullAndEmptyArrays: true,
          }, // Unwind matched variant
        },
        {
          $group: {
            _id: "$_id", // Group by cart _id to collect all items
            user_id: { $first: "$user_id" },
            items: {
              $push: {
                $cond: [
                  { $ne: ["$items", {}] }, // Only include valid items
                  {
                    product_id: "$items.product_id",
                    product_name: "$productREF.product_name",
                    product_variant_id: "$items.product_variant_id",
                    product_variant_name: "$matchedVariant.name", // Adjust field name as needed
                    no_of_product: "$items.no_of_product",
                    product_selling_price: "$matchedVariant.selling_price", // Adjust field name as needed
                    item_total_price: "$items.item_total_price",
                    _id: "$items._id",
                  },
                  null,
                ],
              },
            },
            cart_total: { $first: "$cart_total" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
          },
        },
        {
          $project: {
            _id: 1,
            user_id: 1,
            items: {
              $filter: {
                input: "$items",
                as: "item",
                cond: { $ne: ["$$item", null] }, // Remove null items
              },
            },
            cart_total: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);
      

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
      // const cartProductsID = getCart.items.map(
      //   (prdID) => prdID.product_variant_id
      // );

      // const getCartProducts = await productModel.aggregate([
      //   { $unwind: "$items" },
      //   { $match: { "items._id": { $in: cartProductsID } } },
      //   { $project: { _id: 0, items: 1 } },
      // ]);
      // const mappedProduct = new Map(
      //   getCartProducts.map((prod) => [prod.items._id.toString(), prod.items])
      // );
      // getCart.items = getCart.items.map((cartProd) => {
      //   const isMatched = mappedProduct.get(
      //     cartProd.product_variant_id.toString()
      //   );
      //   if (isMatched) {
      //     cartProd.product_selling_price = isMatched.selling_price || 0;
      //     cartProd.is_available = isMatched.is_available;
      //     cartProd.item_total_price =
      //       cartProd.no_of_product * cartProd.product_selling_price;
      //   } else {
      //     cartProd.item_total_price = 0;
      //   }
      //   return cartProd;
      // });
      // await getCart.save();

      return successResponse(res, "Cart Data Fetched", getCart);
    } catch (error) {
      console.log(error);
      return internalServerErrorResponse(res, error.message);
    }
  },
};

export const { addToCart, removeToCart, getCart } = cartController;
