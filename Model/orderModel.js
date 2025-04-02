import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        MRP: { type: Number, required: true },
        ordered_price:{ type: Number, required: true },
        image: { type: String, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "Credit Card", "Debit Card", "UPI", "Net Banking"],
      required: true,
    },
    paymentResult: {
      paymentId: String, 
      status: String,
      update_time: String,
      email: String,
    },
    itemsPrice: { type: Number, required: true }, 
    // taxPrice: { type: Number, required: true, default: 0.0 }, 
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true } // Automatically creates createdAt and updatedAt fields
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
