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
export type TViewerContext = {
  isOwner: boolean;
  isParticipant: boolean;
  hasRequested: boolean;
};
export type TAllPlansResponse = {
  data: TTravelPlan;
  viewerContext: TViewerContext;
};
