import { model, Schema, Types } from "mongoose";
import { TSavedPost } from "./savedPost.interface";

const savedPostSchema = new Schema<TSavedPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true },
);

savedPostSchema.index({ user: 1, createdAt: -1 });
savedPostSchema.index({ user: 1, post: 1 }, { unique: true });

const SavedPost = model<TSavedPost>("SavedPost", savedPostSchema);

export default SavedPost;
