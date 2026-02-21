import { model, Schema } from "mongoose";
import { TPostVote } from "./postVote.interface";

// store upvote/downvote separately 
const postVoteSchema = new Schema<TPostVote>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["upvote", "downvote"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

postVoteSchema.index({ post: 1, user: 1 }, { unique: true });

const PostVote = model<TPostVote>("PostVote", postVoteSchema);
export default PostVote;
