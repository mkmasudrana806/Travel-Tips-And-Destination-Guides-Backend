import { z } from "zod";

const travelPlanCreate = z.object({
  body: z.object({
    startLocation: z.string(),
    destination: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    minBudget: z.number(),
    maxBudget: z.number(),
  }),
});

export const TravelPlanValidation = {
  travelPlanCreate,
};
