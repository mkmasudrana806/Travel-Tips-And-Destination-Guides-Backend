import { Types } from "mongoose";
import { z } from "zod";

// create a comment schema
const createACommentSchema = z.object({
  body: z.object({
    postId: z
      .string({ required_error: "Product id is required" })
      .refine((value) => Types.ObjectId.isValid(value), {
        message: "Invalid postId, it should be mongoose _id",
      }),
    comment: z.string({
      required_error: "Comment is required",
      invalid_type_error: "Comment should be string",
    }),
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
