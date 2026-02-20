import { Date, Types } from "mongoose";

export type TComment = {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  user: Types.ObjectId;
  comment: string;
  parentComment?: Types.ObjectId | null;
  depth: number;
  replyCount: number;
  createdAt: Date;
  updatedAt: Date;
};
