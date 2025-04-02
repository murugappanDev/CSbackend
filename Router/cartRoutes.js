import { Router } from "express";
import { addToCart, removeToCart,getCart } from "../Controller/cartController.js";
import { userVerificationToken } from "../Controller/userController.js";

const cartRouter = Router();

cartRouter.route("/add").post(userVerificationToken,addToCart);
cartRouter.route("/remove").post(userVerificationToken,removeToCart);
cartRouter.route("/get").get(userVerificationToken,getCart);


export default cartRouter;
