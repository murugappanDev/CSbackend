import { Router } from "express";
import { addToCart, removeToCart,getCart } from "../Controller/cartController.js";
import { userVerificationToken } from "../Controller/userController.js";

const cartRouter = Router();

cartRouter.route("/add").post(addToCart);
cartRouter.route("/remove").post(removeToCart);
cartRouter.route("/get").get(userVerificationToken,getCart);


export default cartRouter;
