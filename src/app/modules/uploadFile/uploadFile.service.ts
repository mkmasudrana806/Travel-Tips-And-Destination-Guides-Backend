import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { TfileUpload } from "../../interface/fileUploadType";
import config from "../../config";
import sendImageToCloudinary from "../../utils/sendImageToCloudinary";
import { Media } from "../media/media.model";

/**
 * ----------------------- save uploaded file into into DB ---------------------
 * @param file uploaded image file info
 * @return return uploaded image url and unique id
 */
const saveImageInfoInDB = async (file: TfileUpload, userId: string) => {
  const mediaEntry = await Media.create({
    url: file.path,
    user: userId,
    isUsed: false,
  });

  return { url: mediaEntry.url, _id: mediaEntry._id };
};

export const uploadFilesServices = {
  saveImageInfoInDB,
};
