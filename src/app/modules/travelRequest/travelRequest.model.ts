import { model, Schema } from "mongoose";
import { TTravelRequest } from "./travelRequest.interface";

const travelRequestSchema = new Schema<TTravelRequest>(
  {
    travelPlan: {
      type: Schema.Types.ObjectId,
      ref: "TravelPlan",
      required: true,
      index: true,
    },
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    requestNote: {
      type: String,
      maxlength: 200,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

travelRequestSchema.index({ travelPlan: 1, status: 1 });
travelRequestSchema.index({ requester: 1, status: 1 });
travelRequestSchema.index({ travelPlan: 1, requester: 1 }, { unique: true });

const TravelRequest = model<TTravelRequest>(
  "TravelRequest",
  travelRequestSchema,
);
export default TravelRequest;
