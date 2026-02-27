import { Date, Types } from "mongoose";

// comment type
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

// comment viewerContex
export type TCommentViewerContext = {
  isOwner: boolean;
};

export type TAllCommentsResponse = {
  data: TComment;
  viewerContext: TCommentViewerContext;
};
