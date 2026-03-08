import { ObjectId } from "mongoose";
import { TPostCategory } from "../post/post.interface";

export type TSavedPost = {
  user: ObjectId;
  post: ObjectId;
  postTitle: string;
  postCategory: TPostCategory;
  createdAt: Date;
  updatedAt: Date;
};

// get all saved post query params
export type TSavedPostQuery = {
  limit: number;
  page: number;
};
