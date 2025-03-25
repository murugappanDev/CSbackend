import { Router } from "express";
import {
  createProduct,
  getAllProduct,
  getProductBasedOnId,
  updateProduct,
  deleteProductBasedOnId,
} from "../Controller/productController.js";
import {
  userVerificationToken,
  adminVerification,
} from "../Controller/userController.js";

const productRouter = Router();

productRouter.route("/add").post(adminVerification, createProduct);
productRouter
  .route("/get")
  .get( getAllProduct);
productRouter.route("/get/:id").get(getProductBasedOnId);
productRouter.route("/update/:id").put(updateProduct);
productRouter.route("/delete/:id").delete(deleteProductBasedOnId);

export default productRouter;
