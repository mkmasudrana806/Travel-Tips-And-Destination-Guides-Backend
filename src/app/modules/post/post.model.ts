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

const Post = model<TPost>("Post", postSchema);
export default Post;
