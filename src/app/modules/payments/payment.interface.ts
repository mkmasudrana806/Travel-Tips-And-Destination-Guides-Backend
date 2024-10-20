import { Date, Types } from "mongoose";

// Payment type
export type TPayment = {
  userId: Types.ObjectId;
  username: string;
  email: string;
  amount: number;
  date: Date;
  expiresIn: Date;
  status: "pending" | "completed" | "falied";
  subscriptionType: "monthly" | "yearly";
  transactionId?: string;
};
