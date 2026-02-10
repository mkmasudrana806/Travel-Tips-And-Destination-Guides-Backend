import { Schema, model } from "mongoose";
import { TMedia } from "./media.interface";

// this media collection is used to store image/file history
const mediaSchema = new Schema<TMedia>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Media = model<TMedia>("Media", mediaSchema);
