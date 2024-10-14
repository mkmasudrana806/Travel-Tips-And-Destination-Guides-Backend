import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { TfileUpload } from "../../interface/fileUploadType";
import asyncHanlder from "../../utils/asyncHandler";
import { uploadFilesServices } from "./uploadFile.service";

// ------------------- create an user -------------------
const uploadImage = asyncHanlder(async (req, res) => {
  const result = await uploadFilesServices.uploadImageIntoCloudinary(
    req.file as TfileUpload
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Image uploaded successfully",
    data: result,
  });
});

export const uploadFiles = {
  uploadImage,
};
