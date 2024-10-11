import { Date, Types } from "mongoose";

export type TComment = {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
};
