import { z } from "zod";

const createPost = z.object({
  title: z
    .string({
      required_error: "Title is required",
    })
    .min(5),
  category: z.enum(["Adventure", "Business Travel", "Exploration"]),
  image: z.string().url("Baner image is not added"),
  content: z
    .string({
      required_error: "content is required",
    })
    .min(100),
  locationName: z.string(),
  country: z.string(),
  travelDays: z.number(),
  estimatedCost: z.number(),
  travelType: z.enum(["budget", "midrange", "luxury"]),
  premium: z.boolean(),
  bannerId: z.string(),
  contentIds: z.array(z.string()),
});

// create post
const createPostValidationSchema = z.object({
  body: createPost.strict(),
});

// update post
const updatePostValidationSchema = z.object({
  body: createPost
    .partial()
    .omit({ bannerId: true, image: true, country: true })
    .strict(),
});

export const PostValidtions = {
  createPostValidationSchema,
  updatePostValidationSchema,
};
