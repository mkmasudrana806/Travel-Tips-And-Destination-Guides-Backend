import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import SavedPost from "./savedPost.model";

/**
 * ------------ saved a travel post ------------
 *
 * @param userId user who want to save a post
 * @param postId post need to save
 * @returns saved post data
 */
const savePost = async (userId: string, postId: string) => {
  // check post already saved or not
  const exists = await SavedPost.findOne({
    user: userId,
    post: postId,
  });

  if (exists) {
    throw new AppError(httpStatus.BAD_REQUEST, "Post already saved!");
  }

  const result = await SavedPost.create({
    user: userId,
    post: postId,
  });

  return result;
};

export const SavedPostService = {
  savePost,
};
