import httpStatus from "http-status";
import AppError from "../../utils/AppError";
import SavedPost from "./savedPost.model";
import Post from "../post/post.model";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import { POST_SAVED_QUERY_OPTIONS } from "./savedPost.query";

/**
 * ------------ saved a travel post ------------
 *
 * @param userId user who want to save a post
 * @param postId post need to save
 * @returns saved post data
 */
const savePost = async (userId: string, postId: string) => {
  // check post exists
  const post = await Post.findById(postId).select("title category");
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post is not found!");
  }
  // check post already saved or not
  const exists = await SavedPost.findOne({
    user: userId,
    post: postId,
  });

  if (exists) {
    throw new AppError(httpStatus.CONFLICT, "Post already saved!");
  }

  const result = await SavedPost.create({
    user: userId,
    post: postId,
    postTitle: post.title,
    postCategory: post.category,
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
  const result = await SavedPost.findOneAndDelete({
    user: userId,
    post: postId,
  });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "Saved post not found!");
  }

  return { isDeleted: true };
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
  const queryBuilder = new QueryBuilder(
    SavedPost.find({ user: userId }),
    query,
    POST_SAVED_QUERY_OPTIONS,
  )
    .search()
    .filter()
    .fieldsLimiting()
    .sort()
    .paginate()
    .populate({
      path: "post",
      populate: {
        path: "author",
        select: "name profilePicture",
      },
    })
    .lean();

  const data = await queryBuilder.modelQuery;
  const meta = await queryBuilder.countTotal();

  return { data, meta };
};

export const SavedPostService = {
  savePost,
  deleteSavedPost,
  getAllSavedPosts,
};
