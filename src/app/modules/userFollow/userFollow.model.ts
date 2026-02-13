import { model, Schema, Types } from "mongoose";
import { TUserFollow } from "./userFollow.interface";

// who following whom
const userFollowSchema = new Schema<TUserFollow>(
  {
    follower: { type: Schema.Types.ObjectId, ref: "Follow", required: true },
    following: { type: Schema.Types.ObjectId, ref: "Follow", required: true },
  },
  {
    timestamps: true,
  },
);

userFollowSchema.index({ follower: 1 });
userFollowSchema.index({ following: 1 });
userFollowSchema.index({ follower: 1, following: 1 }, { unique: true });

const UserFollow = model<TUserFollow>("UserFollow", userFollowSchema);
export default UserFollow;
