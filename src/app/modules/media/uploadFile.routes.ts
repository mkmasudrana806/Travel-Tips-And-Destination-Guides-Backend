import express, { NextFunction, Request, Response } from "express";
import { uploadFiles } from "./uploadFile.controller";
import { CloudinaryMulterUpload } from "../../config/multer.config";
import auth from "../../middlewares/auth";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import validateRequestData from "../../middlewares/validateRequest";
import { MediaValidationSchema } from "../media/media.validation";
const router = express.Router();

// ------- upload single image to cloudinary ----------
router.post(
  "/",
  auth("user", "admin"),
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
  uploadFiles.uploadFileToCloudinary,
);

export const MediaUploadRoutes = router;
