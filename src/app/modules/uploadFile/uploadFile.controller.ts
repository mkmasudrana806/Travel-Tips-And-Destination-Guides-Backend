import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { TfileUpload } from "../../interface/fileUploadType";
import asyncHanlder from "../../utils/asyncHandler";
import { uploadFilesServices } from "./uploadFile.service";

// ------------------- create an user -------------------
const uploadImageCloudinary = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const file = req.body;
  const result = await uploadFilesServices.saveImageInfoInDB(file, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Image uploaded successfully",
    data: result,
  });
});

export const uploadFiles = {
  uploadImageCloudinary,
};
