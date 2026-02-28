import { Types } from "mongoose";
import httpStatus from "http-status";
import AppError from "./AppError";

// value optional for optionAuth. required=true for all except optionalAuth=false
type TObjectIdInput = {
  name: string;
  value?: string | null;
  required?: boolean;
};

const validateObjectId = (...inputs: TObjectIdInput[]) => {
  for (const input of inputs) {
    const { name, value, required = true } = input;

    // for all cases value && required should exists.
    if (!value) {
      if (required) {
        throw new AppError(httpStatus.BAD_REQUEST, `${name} is required`);
      }
      continue; // skip optional empty value
    }

    // strict validation
    const isValid =
      Types.ObjectId.isValid(value) &&
      new Types.ObjectId(value).toString() === value;

    if (!isValid) {
      throw new AppError(httpStatus.BAD_REQUEST, `Invalid ${name}`);
    }
  }
};

export default validateObjectId;
