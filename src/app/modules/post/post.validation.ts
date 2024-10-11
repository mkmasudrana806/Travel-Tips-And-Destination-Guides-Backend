import { z } from "zod";

// create post
const createPostValidationSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(10),
  category: z.enum(["Adventure", "Business Travel", "Exploration", "Other"]),
  premium: z.boolean().optional(),
  image: z.string(),
});

// update post
const updatePostValidationSchema = z.object({
  title: z.string().min(5).optional(),
  content: z.string().min(10).optional(),
  category: z.string().optional(),
  premium: z.boolean().optional(),
  images: z.array(z.string()).optional(),
});

export const PostValidtions = {
  createPostValidationSchema,
  updatePostValidationSchema,
};
