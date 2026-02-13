import { ObjectId } from "mongoose";

// follower and following
export type TUserFollow = {
  follower: ObjectId;
  following: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
