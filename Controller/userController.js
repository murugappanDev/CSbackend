import mongoose from "mongoose";
import userModel from "../Model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  checkAllFields,
  internalServerErrorResponse,
  InvalidDataResponse,
  failedResponse,
  successResponse,
  duplicateResponse,
  InvalidAuthorizationResponse,
} from "../utils/responseHelper.js";
import cartModel from "../Model/CartModel.js";
import wishListModel from "../Model/wishListModel.js";

const userController = {
  createUser: async (req, res) => {
    try {
      const { user_name, password, email, mobile_no,user_role } = req.body;
      const requiredField = ["user_name", "password", "email", "mobile_no"];
      const checkRequiredField = checkAllFields(req.body, requiredField);

      if (!checkRequiredField) {
        return InvalidDataResponse(res, "invalid Data Format", req.body);
      }
      const salting = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salting);

      const userBody = {
        user_name,
        email: email.toLowerCase(),
        mobile_no,
        password: hashPassword,
        user_role: user_role ?? "user"
      };

      const newUser = await userModel.create(userBody);
      const cartBody = {
        user_id: newUser._id,
        items: [],
        cart_total: 0,
      };

      const createCart = await cartModel.create(cartBody);
      const createWishlist = await wishListModel({
        user_id: newUser._id,
        products: [],
      });

      const deletedPassword = newUser.toObject();
      delete deletedPassword.password;

      if (!newUser || !createCart || !createWishlist) {
        return failedResponse(res, "create user Failed", []);
      }

      return successResponse(res, "User Created", deletedPassword);
    } catch (error) {
      if (
        error.code === 11000 &&
        error.keyPattern.mobile_no === 1 &&
        error.keyValue.mobile_no
      ) {
        return duplicateResponse(res, "mobile_no", error.message);
      }
      if (
        error.code === 11000 &&
        error.keyPattern.email === 1 &&
        error.keyValue.email
      ) {
        return duplicateResponse(res, "Email", error.message);
      }
      return internalServerErrorResponse(res, error.message);
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    const requiredField = ["email", "password"];
    const checkRequiredField = checkAllFields(req.body, requiredField);

    if (!checkRequiredField) {
      return InvalidDataResponse(res, req.body);
    }
    const isExisting = await userModel.findOne({ email: email });
    if (!isExisting) {
      return failedResponse(res, "Email Not Found", req.body);
    }
    const comparePassword = await bcrypt.compare(password, isExisting.password);
    if (!comparePassword) {
      return InvalidDataResponse(res, "Invalid Credential", req.body);
    }
    const token = await jwt.sign(
      { _id: isExisting._id, user_role: isExisting.user_role },
      process.env.SecretKey,
      { expiresIn: "7d" }
    );
    if (!token) {
      return failedResponse(res, "Failed To Generate Token", []);
    }
    let removePassword = isExisting.toObject();
    delete removePassword.password;
    const data = {
      token: token,
      data: removePassword,
    };
    return successResponse(res, "Login", data);
  },
  userVerificationToken: async (req, res, next) => {
    try {
      const token = req?.headers?.["authorization"];
      if (!token) {
        return InvalidAuthorizationResponse(
          res,
          401,
          "Unauthorized - Token Missing or Invalid Format",
          token
        );
      }

      jwt.verify(token, process.env.SecretKey, (error, authAccess) => {
        if (error) {
          return InvalidDataResponse(
            res,
            403,
            "Forbidden - Invalid or Expired Token",
            []
          );
        }
        req.user = authAccess;
        next();
      });
    } catch (error) {
      return internalServerErrorResponse(res, error.message);
    }
  },
  adminVerification: async (req, res, next) => {
    try {
      const token = req?.headers?.["authorization"];
      if (!token) {
        return InvalidAuthorizationResponse(
          res,
          401,
          "Unauthorized - Token Missing or Invalid Format",
          token
        );
      }
      jwt.verify(token, process.env.SecretKey, (error, admin) => {
        if (error) {
          return InvalidAuthorizationResponse(
            res,
            403,
            "Forbidden - Invalid or Expired Token",
            []
          );
        }

        if (admin.user_role !== "admin") {
          return InvalidAuthorizationResponse(
            res,
            403,
            "Forbidden - Access Denied. Admins Only.",
            []
          );
        }
        req.admin = admin;
        next();
      });
    } catch (error) {
      return internalServerErrorResponse(res, error.message);
    }
  },
};

export const {
  createUser,
  login,
  userVerificationToken,
  adminVerification,
} = userController;
