import { ObjectId } from "mongoose";

export type TSavedPost = {
  user: ObjectId;
  post: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
