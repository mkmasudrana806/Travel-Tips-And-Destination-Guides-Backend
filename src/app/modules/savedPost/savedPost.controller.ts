import httpStatus from "http-status";
import asyncHanlder from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { SavedPostService } from "./savedPost.service";

// --------------- saved a post ----------------
const savedPost = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.postId;

  const result = await SavedPostService.savePost(userId, postId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post savedd successfully",
    data: result,
  });
});

// --------------- delete/unsaved a saved post ----------------
const deleteSavedPost = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const postId = req.params.postId;
  const result = await SavedPostService.deleteSavedPost(userId, postId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Saved post deleted successfully",
    data: result,
  });
});

// -------------- get all saved posts ---------------
const getAllSavedPosts = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;

  const { data, meta } = await SavedPostService.getAllSavedPosts(
    userId,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All post retrived successfull",
    data: data,
    meta: data,
  });
});

export const SavedPostController = {
  savedPost,
  deleteSavedPost,
  getAllSavedPosts,
};
