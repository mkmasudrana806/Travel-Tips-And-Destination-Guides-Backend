import { z } from "zod";

const travelPlanBodySchema = z.object({
  startLocation: z.string().max(128),
  destination: z.string().max(128),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  minBudget: z.number().max(100000),
  maxBudget: z.number().max(100000),
  contact: z.string().max(32),
  note: z.string().max(200, "Maximum 200 characters are allowed"),
});

// create travel
const travelPlanCreate = z.object({
  body: travelPlanBodySchema.strict(),
});

// update travel
const updateTravelPlan = z.object({
  body: travelPlanBodySchema
    .partial()
    .extend({ status: z.enum(["closed"]) })
    .strict(),
});

export const TravelPlanValidation = {
  travelPlanCreate,
  updateTravelPlan,
};
