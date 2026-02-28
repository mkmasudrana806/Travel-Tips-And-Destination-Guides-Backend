import { Types } from "mongoose";
import { z } from "zod";

/**
 * ------------- validate mongoose object id in zod schama ---------
 *
 * @param fieldName field name for personalized error show
 * @returns error if invalid field value
 */
const objectId = (fieldName: string) =>
  z
    .string()
    .refine(
      (val) =>
        Types.ObjectId.isValid(val) &&
        new Types.ObjectId(val).toString() === val,
      {
        message: `Invalid ${fieldName}`,
      },
    );

export default objectId;
