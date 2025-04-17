import { Router } from "express";
import { createOrders } from "../Controller/orderController.js";
import { userVerificationToken } from "../Controller/userController.js";


const orderRouter = Router()

orderRouter.route("/add").post(userVerificationToken,createOrders)


export default orderRouter