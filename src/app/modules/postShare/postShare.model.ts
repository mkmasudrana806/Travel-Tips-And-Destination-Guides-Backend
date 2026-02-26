import { Schema, model } from "mongoose";
import { TPostShare } from "./postShare.interface";

const postShareSchema = new Schema<TPostShare>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    caption: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const PostShare = model<TPostShare>("PostShare", postShareSchema);
