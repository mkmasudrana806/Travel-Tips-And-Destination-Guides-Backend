import { Types } from "mongoose";
import { z } from "zod";

// create a comment schema
const createACommentSchema = z.object({
  body: z.object({
    post: z
      .string({ required_error: "Product id is required" })
      .refine((value) => Types.ObjectId.isValid(value), {
        message: "Invalid postId, it should be mongoose _id",
      }),
    content: z.string({
      required_error: "Content is required",
      invalid_type_error: "Content should be string",
    }),
    parentComment: z
      .string()
      .optional()
      .nullable(),
  }),
});

// update a comment schema
const updateACommentSchema = z.object({
  body: z.object({
    comment: z.string({
      required_error: "Comment is required",
      invalid_type_error: "Comment should be string",
    }),
  }),
});

export const CommentValidations = {
  createACommentSchema,
  updateACommentSchema,
};
