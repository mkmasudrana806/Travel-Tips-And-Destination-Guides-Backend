import { z } from "zod";

const createTravelRequest = z.object({
  body: z
    .object({
      requestNote: z.string().max(200, "Maximum 200 characters are allowed"),
    })
    .strict(),
});

export const TravelRequestValidation = {
  createTravelRequest,
};
