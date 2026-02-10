import { Types } from "mongoose";

export type TMedia = {
  user: Types.ObjectId;
  url: string;
  isUsed: boolean;
};
