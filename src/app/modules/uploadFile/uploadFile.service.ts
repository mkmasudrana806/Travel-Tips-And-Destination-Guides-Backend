import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { TfileUpload } from "../../interface/fileUploadType";
import config from "../../config";
import sendImageToCloudinary from "../../utils/sendImageToCloudinary";

/**
 * ----------------------- upload an image ---------------------
 * @param file image file to upload
 */
const uploadImageIntoCloudinary = async (file: TfileUpload) => {
  // throw error no image is fuplied
  if (!file) {
    throw new AppError(httpStatus.FORBIDDEN, "No image was attached!");
  }

  const imageName = file.originalname;
  const path = file.path;
  const uploadedImage: any = await sendImageToCloudinary(path, imageName);
  if (!uploadedImage?.secure_url)
    throw new AppError(httpStatus.BAD_REQUEST, "Image is not uploaded");

  return uploadedImage.secure_url;
};

export const uploadFilesServices = {
  uploadImageIntoCloudinary,
};
