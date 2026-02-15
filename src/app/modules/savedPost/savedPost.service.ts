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

/**
 *  ------------ delete a saved travel post ------------
 * @param userId who want to delete saved post
 * @param postId post need to be unsaved/deleted
 * @returns true
 */
const deleteSavedPost = async (userId: string, postId: string) => {
  await SavedPost.findOneAndDelete({
    user: userId,
    post: postId,
  });

  return true;
};

export const SavedPostService = {
  savePost,
  deleteSavedPost,
};
