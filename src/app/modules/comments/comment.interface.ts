import { Date, Types } from "mongoose";

export type TComment = {
  _id: Types.ObjectId;
  post: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  parentComment?: Types.ObjectId | null;
  depth: number;
  replyCount: number;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
};
