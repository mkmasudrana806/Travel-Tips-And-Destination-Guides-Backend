import { Types } from "mongoose";

export type TTravelPlan = {
  user: Types.ObjectId;
  startLocation: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  travelDays: number;
  minBudget: number;
  maxBudget: number;
  status: "open" | "closed";
  createdAt: Date;
  updatedAt: Date;
};
