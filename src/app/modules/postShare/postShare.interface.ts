import { ObjectId } from "mongoose";

export type TPostShare = {
  post: ObjectId;
  user: ObjectId; // who share post
  caption: string | null;
  createdAt: Date;
  updatedAt: Date;
};
