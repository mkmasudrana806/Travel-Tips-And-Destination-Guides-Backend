import { Schema, model } from "mongoose";
import { TComment } from "./comment.interface";

// comment schema
const commentSchema = new Schema<TComment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Comment = model<TComment>("Comment", commentSchema);
