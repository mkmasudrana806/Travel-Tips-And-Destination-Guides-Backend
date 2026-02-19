import { Date, Types } from "mongoose";

// Payment type
export type TPayment = {
  userId: Types.ObjectId;
  username: string;
  email: string;
  amount: number;
  paymentDate: Date;
  expiresIn: Date;
  status: "pending" | "completed" | "failed";
  subscriptionType: "monthly" | "yearly";
  transactionId?: string;
};
