import { Router } from "express";
import {
  addToWishList,
  removeToWishList,
  getWishlistProduct,
} from "../Controller/wishListController.js";
import { userVerificationToken } from "../Controller/userController.js";

const wishListRouter = Router();

wishListRouter.route("/add").post(userVerificationToken, addToWishList);
wishListRouter.route("/remove").post(userVerificationToken, removeToWishList);
wishListRouter.route("/get").get(userVerificationToken, getWishlistProduct);

export default wishListRouter;
