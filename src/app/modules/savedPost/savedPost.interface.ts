import { ObjectId } from "mongoose";

export type TSavedPost = {
  user: ObjectId;
  post: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

// get all saved post query params
export type TSavedPostQuery = {
  limit: number;
  page: number;
};
