import { z } from "zod";

// payload validation for UserFollow
const userFollowValidation = z.object({
  body: z
    .object({
      follower: z.string(),
      following: z.string(),
    })
    .strict(),
});

export const userFollowValidations = {
  userFollowValidation,
};
