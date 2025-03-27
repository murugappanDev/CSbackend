import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./DBAccess/dbConfig.js";
import userRouter from "./Router/userRoutes.js";
import productRouter from "./Router/productRoutes.js";
import cartRouter from "./Router/cartRoutes.js";
import wishListRouter from "./Router/wishlistRoutes.js";

const app = express();
dotenv.config();
app.use(express.json());

const port = process.env.PORT;

app.use(cors());

connectDB();
app.use("/user", userRouter)
app.use("/product", productRouter)
app.use("/cart", cartRouter)
app.use("/wishlist", wishListRouter)



app.listen(port, () => {
  console.log(`Sever is Running Under ${port}`);
});
