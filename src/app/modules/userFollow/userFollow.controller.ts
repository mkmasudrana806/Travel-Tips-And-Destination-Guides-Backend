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

// ------------------- get followers of an user -------------------
const getFollowers = asyncHanlder(async (req, res) => {
  const userId = req.params.userId;
  const query = req.query;
  const { meta, result } = await UserFollowService.getFollowers(userId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Followers retrived sucessfull",
    data: result,
    meta: meta,
  });
});

// ------------------- get followings lists of an user -------------------
const getFollowings = asyncHanlder(async (req, res) => {
  const userId = req.params.userId;
  const query = req.query;
  const { meta, result } = await UserFollowService.getFollowings(userId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Followings retrived sucessfully",
    data: result,
    meta: meta,
  });
});

export const UserFollowController = {
  toggleFollow,
  getFollowers,
  getFollowings,
};
