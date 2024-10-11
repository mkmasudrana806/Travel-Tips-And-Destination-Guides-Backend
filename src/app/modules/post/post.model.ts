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
      enum: ["Adventure", "Business Travel", "Exploration", "Other"],
    },
    image: { type: String },
    premium: { type: Boolean, default: false },
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Post = model<TPost>("Post", postSchema);
export default Post;
