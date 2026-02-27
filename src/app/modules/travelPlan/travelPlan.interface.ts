import { Types } from "mongoose";

// type for travel plan
export type TTravelPlan = {
  user: Types.ObjectId;
  startLocation: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  travelDays: number;
  minBudget: number;
  maxBudget: number;
  contact: string;
  note: string;
  status: "open" | "closed";
  createdAt: Date;
  updatedAt: Date;
};

// viewer context and response type
export type TViewerContextTravelPlan = {
  isOwner: boolean;
  requestStatus: "none" | "pending" | "cancelled" | "accepted" | "rejected";
};
export type TAllPlansResponse = {
  data: TTravelPlan;
  viewerContext: TViewerContextTravelPlan;
};
