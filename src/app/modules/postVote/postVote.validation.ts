import { z } from "zod";

// payload for upvote/downvote
const postVoteValidation = z.object({
  body: z
    .object({
      voteType: z.enum(["upvote", "downvote"]),
    })
    .strict(),
});

export const PostVoteValidations = {
  postVoteValidation,
};
