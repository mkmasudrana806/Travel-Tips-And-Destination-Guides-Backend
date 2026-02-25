import { z } from "zod";

const createTravelRequest = z.object({
  body: z
    .object({
      requestNote: z.string().max(200, "Maximum 200 characters are allowed"),
    })
    .strict(),
});

// update partner request (accepted or rejected by travelPlan owner)
const updatePartnerRequest = z.object({
  body: z
    .object({
      status: z.enum(["accepted", "rejected"]),
    })
    .strict(),
});

// cancel travel request by requester
const cancelTravelRequest = z.object({
  body: z
    .object({
      status: z.enum(["cancelled"]),
    })
    .strict(),
});

export const TravelRequestValidation = {
  createTravelRequest,
  updatePartnerRequest,
  cancelTravelRequest,
};
