import { model, Schema } from "mongoose";
import { TTravelPlan } from "./travelPlan.interface";

const travelPlanSchema = new Schema<TTravelPlan>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startLocation: {
      type: String,
      required: true,
    },
    destination: { type: String, required: true },
    startDate: {
      type: Date,
      required: true,
      default: new Date(),
    },
    endDate: { type: Date, required: true },
    travelDays: { type: Number, required: true },
    minBudget: {
      type: Number,
      required: true,
    },
    maxBudget: {
      type: Number,
      required: true,
    },
    contact: {
      type: String,
      required: true,
      select: 0,
    },
    note: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  },
);

travelPlanSchema.index({ user: 1, createdAt: -1 });
travelPlanSchema.index({ destination: 1 });
travelPlanSchema.index({ travelDays: 1 });
travelPlanSchema.index({
  destination: 1,
  minBudget: 1,
  maxBudget: 1,
});
travelPlanSchema.index({
  destination: 1,
  travelDays: 1,
});
travelPlanSchema.index({
  destination: 1,
  startDate: 1,
  endDate: 1,
});

const TravelPlan = model<TTravelPlan>("TravelPlan", travelPlanSchema);

export default TravelPlan;
