import { z } from "zod";
import objectId from "../../utils/validateObjectIdInZod";

const createPost = z.object({
  title: z
    .string({
      required_error: "Title is required",
    })
    .min(5)
    .max(128),
  category: z.enum(["Adventure", "Business Travel", "Exploration"]),
  image: z.string().url("Baner image is not added"),
  content: z
    .string({
      required_error: "content is required",
    })
    .min(100)
    .max(50000),
  locationName: z.string().max(128),
  country: z.string().max(100),
  travelDays: z.number().max(100),
  estimatedCost: z.number().max(100_000),
  travelType: z.enum(["budget", "midrange", "luxury"]),
  premium: z.boolean(),
  bannerId: objectId("banner id"),
  contentIds: z.array(objectId("content ids")),
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
