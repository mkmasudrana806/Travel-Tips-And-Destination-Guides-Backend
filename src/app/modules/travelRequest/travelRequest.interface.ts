import { Types } from "mongoose";

export type TTravelRequest = {
  travelPlan: Types.ObjectId;
  requester: Types.ObjectId;
  requestNote: String;
  status: "pending" | "accepted" | "rejected";
};
