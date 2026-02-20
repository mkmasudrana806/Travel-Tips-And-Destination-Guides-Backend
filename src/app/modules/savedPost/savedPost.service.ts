import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import SavedPost from "./savedPost.model";
import { TSavedPostQuery } from "./savedPost.interface";

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
 *
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

/**
 * ------------- get all saved posts --------------
 *
 * @param userId user who want to get his all saved posts
 * @param query limit and page
 * @returns all saved post based on query
 */
const getAllSavedPosts = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;

  const skip = (page - 1) * limit;

  const data = await SavedPost.find({ user: userId })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "post",
      populate: {
        path: "author",
        select: "name profilePicture",
      },
    });
  const total = await SavedPost.countDocuments({ user: userId });
  const meta = { total, page, limit };
  return { data, meta };
};

export const SavedPostService = {
  savePost,
  deleteSavedPost,
  getAllSavedPosts,
};
