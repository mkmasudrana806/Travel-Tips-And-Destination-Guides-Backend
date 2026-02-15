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
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  const result = await SavedPostService.getAllSavedPosts(userId, {
    page,
    limit,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All post retrived successfull",
    data: result,
  });
});

export const SavedPostController = {
  savedPost,
  deleteSavedPost,
  getAllSavedPosts,
};
