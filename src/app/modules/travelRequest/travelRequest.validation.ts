import { z } from "zod";

const createTravelRequest = z.object({
  body: z
    .object({
      requestNote: z.string().max(200, "Maximum 200 characters are allowed"),
    })
    .strict(),
});

// accept or reject partner request
const acceptRejectPartnerRequest = z.object({
  body: z
    .object({
      status: z.enum(["accepted", "rejected"]),
    })
    .strict(),
});

export const TravelRequestValidation = {
  createTravelRequest,
  acceptRejectPartnerRequest,
};
