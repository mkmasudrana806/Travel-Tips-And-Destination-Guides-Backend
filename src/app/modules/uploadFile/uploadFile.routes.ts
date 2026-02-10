import express, { NextFunction, Request, Response } from "express";
import { uploadFiles } from "./uploadFile.controller";
import { upload } from "../../utils/upload";
import { CloudinaryMulterUpload } from "../../config/multer.config";
import auth from "../../middlewares/auth";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import validateRequestData from "../../middlewares/validateRequest";
import { MediaValidationSchema } from "../media/media.validation";
const router = express.Router();

// ------- upload single image to cloudinary ----------
router.post(
  "/upload-image",
  auth("user"),
  CloudinaryMulterUpload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
      req.body = req.file;
      validateRequestData(MediaValidationSchema);
      next();
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, "Failed to upload file!");
    }
  },
  uploadFiles.uploadImageCloudinary,
);

export const CloudinaryUploadFileRoutes = router;
