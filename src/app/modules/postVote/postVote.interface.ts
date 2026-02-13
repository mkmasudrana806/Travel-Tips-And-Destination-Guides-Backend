import { ObjectId } from "mongoose";

export enum VoteType {
  UPVOTE = "upvote",
  DOWNVOTE = "downvote",
}

export type TPostVote = {
  post: ObjectId;
  user: ObjectId;
  type: "upvote" | "downvote";
  createdAt: Date;
  updatedAt: Date;
};
