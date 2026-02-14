import { ObjectId } from "mongoose";

export enum VoteType {
  UPVOTE = "upvote",
  DOWNVOTE = "downvote",
}

// PostVote structure
export type TPostVote = {
  post: ObjectId;
  user: ObjectId;
  type: "upvote" | "downvote";
  createdAt: Date;
  updatedAt: Date;
};

// vote status of a post for an user
export type TStatusVote = {
  hasVoted: boolean;
  type: "upvote" | "downvote" | null;
};
