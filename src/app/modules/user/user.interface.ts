import { Model } from "mongoose";

// user type
export type TUser = {
  name: string;
  email: string;
  password: string;
  passwordChangedAt?: Date;
  age: number;
  gender: "male" | "female" | "others";
  contact: string;
  address: string;
  role: "user" | "admin";
  status: "active" | "blocked";
  profilePicture?: string;
  isVerified?: boolean;
  premiumAccess?: boolean;
  followers?: string[];
  following?: string[];
  isDeleted: boolean;
};

// statics methods to check isPasswordMatch
export interface IUser extends Model<TUser> {
  isPasswordMatch(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean>;

  //check if the jwt issued before password change
  isJWTIssuedBeforePasswordChange(
    passwordChangedTimestamp: Date,
    jwtIssuedtimestamp: number
  ): boolean;
}
