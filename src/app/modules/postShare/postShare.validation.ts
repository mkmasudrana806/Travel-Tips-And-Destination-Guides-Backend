import { z } from "zod";

const createPostShare = z.object({
  body: z
    .object({
      caption: z
        .string()
        .max(300, "Caption must be less than 300 characters")
        .optional(),
    })
    .strict(),
});

export const PostShareValidation = {
  createPostShare,
};
