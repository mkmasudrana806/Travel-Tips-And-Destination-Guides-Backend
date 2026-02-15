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

export const SavedPostController = {
  savedPost,
};
