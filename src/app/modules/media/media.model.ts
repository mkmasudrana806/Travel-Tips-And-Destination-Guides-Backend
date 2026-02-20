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

// create index for isUsed field to optimize cron job query
// this index help to quickly find unused media files for cleanup
mediaSchema.index({ isUsed: 1 });

export const Media = model<TMedia>("Media", mediaSchema);
