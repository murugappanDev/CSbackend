import mongoose from "mongoose";
import productModel from "../Model/productModel.js";
import {
  failedResponse,
  internalServerErrorResponse,
  InvalidDataResponse,
  successResponse,
} from "../utils/responseHelper.js";
import Order from "../Model/orderModel.js";

const orderController = {
  createOrders: async (req, res) => {
    try {
      const user_id = req.user._id;
      const orderItems = req.body.orderItems;
      const orderedProductsId = orderItems.map(
        (item) => new mongoose.Types.ObjectId(item.product_variant_id)
      );
      let productIsAvailable = await productModel.aggregate([
        { $unwind: "$items" },
        { $match: { "items._id": { $in: orderedProductsId } } },
        {
          $project: {
            items: 1,
            product_name: "$product_name",
            product_id: "$_id",
          },
        },
      ]);
      let totalPrice = 0;
      for (let orderItem of orderItems) {
        const matchProduct = productIsAvailable.find(
          (productId) =>
            productId.items._id.toString() ===
            orderItem.product_variant_id.toString()
        );
        if (!matchProduct) {
          return failedResponse(res, 404, "No Product is matched");
        }
        if (
          matchProduct.items.stock < orderItem.quantity ||
          !matchProduct.items.is_available
        ) {
          return failedResponse(res, "product is Out Of Stock", orderItem);
        }

        const itemPrice = matchProduct.items.selling_price * orderItem.quantity;
        totalPrice += itemPrice;
      }
      const shipping_price = totalPrice > 1000 ? 0 : 80;
      const inputData = {
        ...req.body,
        ordered_by: user_id,
        itemsPrice: totalPrice,
        shippingPrice: shipping_price,
        totalPrice: totalPrice + shipping_price,
      };
      if (inputData.paymentMethod === "COD") {
        const CodOrder = await Order.create(inputData);

        for (let codItem of CodOrder.orderItems) {
          const matchedProduct = productIsAvailable.find(
            (product) =>
              product.items._id.toString() ===
              codItem.product_variant_id.toString()
          );

          if (matchedProduct) {
            const newStock = matchedProduct.items.stock - codItem.quantity;
            const isAvailable = newStock > 0;

            await productModel.updateOne(
              {
                _id: matchedProduct.product_id,
                "items._id": matchedProduct.items._id,
              },
              {
                $set: {
                  "items.$.stock": newStock,
                  "items.$.is_available": isAvailable,
                },
              }
            );
          }
        }

        return successResponse(res, "Ordered Placed Successfully", CodOrder);
      }
      return failedResponse(res, "waiting for code", []);
    } catch (error) {
      if (error.name === "ValidationError") {
        return InvalidDataResponse(res, "Data Format", req.body);
      }
      internalServerErrorResponse(res, error.message);
    }
  },
};

export const { createOrders } = orderController;
