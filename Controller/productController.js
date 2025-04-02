import mongoose from "mongoose";
import productModel from "../Model/productModel.js";
import {
  duplicateResponse,
  failedResponse,
  internalServerErrorResponse,
  InvalidDataResponse,
  successResponse,
} from "../utils/responseHelper.js";

const productController = {
  createProduct: async (req, res) => {
    try {
      const {
        product_name,
        description,
        quantity = [],
        category,
        image,
      } = req.body;
      const getAllItems = quantity.map((item) => {
        return {
          quantity: item?.quantity,
          actual_price: item?.actual_price ?? 0,
          discount: item?.discount ?? 0,
          selling_price:
            item?.actual_price - item?.actual_price * (item?.discount / 100),
          stock: item?.stock ?? 0,
        };
      });
      const   createdBy = req?.admin?._id;
      const body = {
        product_name,
        description,
        items: getAllItems,
        category,
        image,
        created_by: createdBy,
      };
      const newProduct = await productModel.create(body);
      if (!newProduct) {
        return failedResponse(res, "create Product Failed", []);
      }

      return successResponse(res, "Product Created", newProduct);
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          statusCode: 400,
          message: "Invalid Data Format",
          data: error.message,
        });
      }
      if (
        error.code === 11000 &&
        error.keyPattern.product_name === 1 &&
        error.keyValue.product_name
      ) {
        return duplicateResponse(res, "Product", error.message);
      }
      return internalServerErrorResponse(res, error.message);
    }
  },

  getAllProduct: async (req, res) => {
    try {
      const getAllProduct = await productModel.find();
      if (!getAllProduct) {
        return failedResponse(res, "Failed To Fetch Product Data", []);
      }
      if (getAllProduct.length === 0) {
        return failedResponse(res, "No Data Found", []);
      }
      return successResponse(res, "Data Fetched Successfully", getAllProduct);
    } catch (error) {
      return internalServerErrorResponse(res, error.message);
    }
  },
  getProductBasedOnId: async (req, res) => {
    try {
      const productID = req.params.id;
      if (!productID || !mongoose.Types.ObjectId.isValid(productID)) {
        return InvalidDataResponse(res, "Data Format Please check");
      }
      const getProduct = await productModel.findById(productID);

      if (!getProduct) {
        return failedResponse(res, "Failed To Fetch Product Data", []);
      }
      return successResponse(res, "Data Fetched Successfully", getProduct);
    } catch (error) {
      return internalServerErrorResponse(res, error.message);
    }
  },
  updateProduct: async (req, res) => {
    try {
      const productID = req.params.id;
      if (!productID || !mongoose.Types.ObjectId.isValid(productID)) {
        return InvalidDataResponse(res, "Please check Data Format");
      }
      const {
        product_name,
        description,
        quantity = [],
        category,
        image,
        updated_by,
      } = req.body;
      const getAllItems = quantity.map((item) => {
        return {
          quantity: item?.quantity,
          actual_price: item?.actual_price ?? 0,
          discount: item?.discount ?? 0,
          selling_price:
            item?.actual_price - item?.actual_price * (item?.discount / 100),
          stock: item?.stock ?? 0,
        };
      });
      const body = {
        product_name,
        description,
        items: getAllItems,
        category,
        image,
        updated_by,
      };

      const updatedProduct = await productModel.findByIdAndUpdate(
        { _id: productID },
        body,
        { new: true }
      );
      if (!updatedProduct) {
        return failedResponse(res, "Product update Failed", []);
      }

      return successResponse(res, "Product Created", updatedProduct);
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          statusCode: 400,
          message: "Invalid Data Format",
          data: error.message,
        });
      }
      return internalServerErrorResponse(res, error.message);
    }
  },
  deleteProductBasedOnId: async (req, res) => {
    try {
      const productID = req.params.id;
      if (!productID || !mongoose.Types.ObjectId.isValid(productID)) {
        return InvalidDataResponse(res, "Please check Data Format");
      }
      const deleteProduct = await productModel.findByIdAndDelete(productID);

      if (!deleteProduct) {
        return failedResponse(res, "Failed To Delete Product Data", []);
      }
      return successResponse(res, "Product Deleted Successfully");
    } catch (error) {
      return internalServerErrorResponse(res, error.message);
    }
  },
};

export const {
  createProduct,
  getAllProduct,
  getProductBasedOnId,
  updateProduct,
  deleteProductBasedOnId,
} = productController;
