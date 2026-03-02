import { Request, Response } from "express";
import { Media } from "../modules/media/media.model";
import { v2 as cloudinary } from "cloudinary";
import sendResponse from "./sendResponse";
import httpStatus from "http-status";
import config from "../config";
import AppError from "./AppError";

function extractPublicId(url: string) {
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  return filename.split(".")[0];
}

/**
 * ---------- cleanup un used orphan media -----------------
 *
 * when user upload their images while writing post, they may not later published that post.
 * but uploaded image already orphan. so delete from cloudinary and Media DB tracking
 */
const BATCH_SIZE = 20;
export const cleanupOrphanMedia = async (req: Request, res: Response) => {
  try {
    // verifiy secret to prevent unauthorized cron hit
    const secret = req.headers.authorization;
    console.log("Secrent is: ", secret, config.cron_secret);
    if (secret !== config.cron_secret) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access!");
    }

    // unused longer than 24hr will be deleted
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    let lastId = null;
    let totalDeleted = 0;

    while (true) {
      const query: any = {
        isUsed: false,
        createdAt: { $lt: cutoff },
      };

      if (lastId) {
        query._id = { $gt: lastId };
      }

      const mediaBatch = await Media.find(query)
        .sort({ _id: 1 })
        .limit(BATCH_SIZE)
        .select("_id url");

      if (mediaBatch.length === 0) break;

      const publicIds = mediaBatch.map((m) => extractPublicId(m.url));

      // bulk delete from cloudinary
      const cloudinaryResult = await cloudinary.api.delete_resources(publicIds);

      // sucessfull deleted ids
      const successfullyDeleted = Object.entries(cloudinaryResult.deleted)
        .filter(([_, status]) => status === "deleted")
        .map(([publicId]) => publicId);

      const deletedMediaIds = mediaBatch
        .filter((m) => successfullyDeleted.includes(extractPublicId(m.url)))
        .map((m) => m._id);

      // delete from DB only those successfully deleted from cloudinary
      await Media.deleteMany({ _id: { $in: deletedMediaIds } });

      totalDeleted += deletedMediaIds.length;

      lastId = mediaBatch[mediaBatch.length - 1]._id;
    }

    sendResponse(res, {
      message: `Total delete completed: ${totalDeleted}`,
      statusCode: httpStatus.OK,
      success: true,
      data: totalDeleted,
    });
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Media cleanup error!",
    );
  }
};
