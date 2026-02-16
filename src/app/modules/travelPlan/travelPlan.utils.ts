import httpStatus from "http-status";
import AppError from "../../utils/AppError";

/**
 * -------- get days different between two date ------------
 * also validate the end date and start date
 *
 * @param startDate start date
 * @param endDate end date
 * @returns return days difference (inclusion)
 */
export const getTravelDays = (
  startDate: Date | undefined,
  endDate: Date | undefined,
) => {
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
  return diff + 1;
};

/**
 * ---------- build travel plan filter -----------------
 *
 * @param query pass query object for the travelPlan feeds
 * @returns equivalent mongodb supported query object
 */
export const buildTravelPlanFilter = (query: Record<string, unknown>) => {
  const filter: any = {};

  if (query.destination) {
    filter.destination = {
      $regex: query.destination,
      $options: "i",
    };
  }

  if (query.startLocation) {
    filter.startLocation = {
      $regex: query.startLocation,
      $options: "i",
    };
  }

  if (query.travelDays) {
    filter.travelDays = Number(query.travelDays);
  }

  if (query.minBudget) {
    filter.maxBudget = { $gte: Number(query.minBudget) };
  }

  if (query.maxBudget) {
    filter.minBudget = { $lte: Number(query.maxBudget) };
  }

  return filter;
};
