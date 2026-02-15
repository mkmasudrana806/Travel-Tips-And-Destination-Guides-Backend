import { Date, Types } from "mongoose";

export type TComment = {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  user: Types.ObjectId;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
};
