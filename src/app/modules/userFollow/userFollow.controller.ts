import httpStatus from "http-status";
import asyncHanlder from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { UserFollowService } from "./userFollow.service";

// ------------------- my vote stutus of a post -------------------
const toggleFollow = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const targetUserId = req.params.targetUserId;
  const result = await UserFollowService.toggleFollow(userId, targetUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Follow is done",
    data: result,
  });
});

export const UserFollowController = {
  toggleFollow,
};
