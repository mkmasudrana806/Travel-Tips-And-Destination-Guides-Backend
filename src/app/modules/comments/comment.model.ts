import { Schema, model } from "mongoose";
import { TComment } from "./comment.interface";

// comment schema
const commentSchema = new Schema<TComment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, "Comment length max 2000 characters"],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    depth: {
      type: Number,
      default: 0,
      max: [2, "Parent comment depth allowed max 2"],
    },
    replyCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  },
);

export const Comment = model<TComment>("Comment", commentSchema);
