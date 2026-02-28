import { Schema, model } from "mongoose";
import TPost from "./post.interface";

const postSchema = new Schema<TPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, minLength: 5, maxLength: 128 },
    content: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Adventure", "Business Travel", "Exploration"],
      maxlength: 50_000,
    },
    locationName: { type: String, required: true, maxlength: 128 },
    country: { type: String, required: true, maxlength: 100 },
    travelDays: { type: Number, required: true, max: 100 },
    estimatedCost: { type: Number, required: true, max: 100_000 },
    travelType: {
      type: String,
      enum: ["budget", "midrange", "luxury"],
      default: "midrange",
    },
    image: { type: String, required: true },
    premium: { type: Boolean, default: false },
    upvoteCount: { type: Number, required: true, default: 0 },
    downvoteCount: { type: Number, required: true, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

postSchema.index({ author: 1 });
postSchema.index({ travelType: 1 });

const Post = model<TPost>("Post", postSchema);
export default Post;
