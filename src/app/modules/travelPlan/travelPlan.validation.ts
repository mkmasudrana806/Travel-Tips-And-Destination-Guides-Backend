import { z } from "zod";

const travelPlanBodySchema = z.object({
  startLocation: z.string(),
  destination: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  minBudget: z.number(),
  maxBudget: z.number(),
  contact: z.string(),
  status: z.enum(["closed"]), // only open -> closed allowed for update
  note: z.string().max(200, "Maximum 200 characters are allowed"),
});

// create travel
const travelPlanCreate = z.object({
  body: travelPlanBodySchema.strict(),
});

// update travel
const updateTravelPlan = z.object({
  body: travelPlanBodySchema.partial().strict(),
});

export const TravelPlanValidation = {
  travelPlanCreate,
  updateTravelPlan,
};
