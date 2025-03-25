import { Router } from "express";
import { addToCart, removeToCart } from "../Controller/cartController.js";

const cartRouter = Router();

cartRouter.route("/add").post(addToCart);
cartRouter.route("/remove").post(removeToCart);

export default cartRouter;
