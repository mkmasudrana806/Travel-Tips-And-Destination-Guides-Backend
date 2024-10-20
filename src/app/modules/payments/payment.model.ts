import { model, Schema } from "mongoose";
import { TPayment } from "./payment.interface";

// mongoose payment schema
const paymentSchema = new Schema<TPayment>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    username: { type: String, required: true },
    email: { type: String, required: true},
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: new Date() },
    expiresIn: { type: Date, required: true, default: new Date() },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    subscriptionType: {
      type: String,
      required: true,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    transactionId: {
      type: String,
      required: true,
      default: "cash_on_delivery",
    },
  },
  { timestamps: true }
);

export const Payment = model("Payment", paymentSchema);
