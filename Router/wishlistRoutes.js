import { Router } from "express";
import { addToWishList ,removeToWishList,getWishlistProduct} from "../Controller/wishListController.js";
import { userVerificationToken } from "../Controller/userController.js";

const wishListRouter = Router()

wishListRouter.route("/add").post(addToWishList)
wishListRouter.route("/remove").post(removeToWishList)
wishListRouter.route("/get").get(userVerificationToken,getWishlistProduct)


export default wishListRouter