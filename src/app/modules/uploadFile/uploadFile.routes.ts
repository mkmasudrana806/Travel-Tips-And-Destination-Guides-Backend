import express, { Request } from "express";
import { uploadFiles } from "./uploadFile.controller";
import { upload } from "../../utils/upload";
const router = express.Router();

router.post("/image", upload.single("file"), uploadFiles.uploadImage);

export const UploadFileRoutes = router;
