import { Schema, model } from "mongoose";
import TPost from "./post.interface";

const postSchema = new Schema<TPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Adventure", "Business Travel", "Exploration"],
    },
    locationName: { type: String, required: true },
    country: { type: String, required: true },
    travelDays: { type: Number, required: true },
    estimatedCost: { type: Number, required: true },
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
