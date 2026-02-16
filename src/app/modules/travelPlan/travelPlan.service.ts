import mongoose from "mongoose";
import { TTravelPlan } from "./travelPlan.interface";
import TravelPlan from "./travelPlan.model";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";

const createTravelPlan = async (
  userId: string,
  payload: Partial<TTravelPlan>,
) => {
  payload.user = new mongoose.Types.ObjectId(userId);

  // travel days calculate and validate
  const { startDate, endDate } = payload;
  if (!startDate || !endDate) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Start date and end date are required",
    );
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "End date must be after start date",
    );
  }

  const msInDay = 1000 * 24 * 60 * 60;
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = (end.getTime() - start.getTime()) / msInDay;
  payload.travelDays = diff + 1; // inclusive days counts

  const result = await TravelPlan.create(payload);
  return result;
};

export const TravelPlanService = {
  createTravelPlan,
};
