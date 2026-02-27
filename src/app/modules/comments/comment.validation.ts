import { z } from "zod";

// create a comment schema
const createACommentSchema = z.object({
  body: z.object({
    content: z.string({
      required_error: "Content is required",
      invalid_type_error: "Content should be string",
    }),
    parentComment: z.string().optional().nullable(),
  }),
});

// update a comment schema
const updateACommentSchema = z.object({
  body: z
    .object({
      content: z.string({
        required_error: "Comment content is required",
        invalid_type_error: "Comment content should be string",
      }),
    })
    .strict(),
});

export const CommentValidations = {
  createACommentSchema,
  updateACommentSchema,
};
