import { z } from "zod";
type IFormData = {
  bannerId: string;
  contentIds: string[];
};
// create post
const createPostValidationSchema = z.object({
  body: z.object({
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
    premium: z.boolean(),
    bannerId: z.string(),
    contentIds: z.array(z.string()),
  }),
});

// update post
const updatePostValidationSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "Title is required",
      })
      .min(5)
      .optional(),
    content: z
      .string({
        required_error: "content is required",
      })
      .min(100)
      .optional(),
    category: z
      .enum(["Adventure", "Business Travel", "Exploration"])
      .optional(),
    premium: z
      .boolean({
        required_error: "premium is required",
        invalid_type_error: "premium value should be boolean",
      })
      .optional(),
  }),
});

export const PostValidtions = {
  createPostValidationSchema,
  updatePostValidationSchema,
};
