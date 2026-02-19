import { Types } from "mongoose";

// Payment type
export type TPayment = {
  user: Types.ObjectId;
  username: string;
  email: string;
  amount: number;
  paymentDate: Date;
  expiresAt: Date;
  status: "pending" | "completed" | "failed" | "cancelled";
  subscriptionType: "monthly" | "yearly";
  transactionId: string;
  paymentProvider: "aamarPay";
};
