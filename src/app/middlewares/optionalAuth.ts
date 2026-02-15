import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { User } from "../modules/user/user.model";
import asyncHanlder from "../utils/asyncHandler";

/**
 * ------------------- optional auth --------------------
 * no roles required. this auth for non logged in, guest, blocked or any public user
 * if token found, then only i will pass the userId to the req.user.userId
 * in controller, is userId is not found, only we serve public data.
 * if user exists, i must return data the user has access only.
 */
const optionalAuth = () => {
  return asyncHanlder(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization;

      // if no token then treat as guest
      if (!token) {
        return next();
      }

      let decoded;
      try {
        decoded = jwt.verify(
          token,
          config.jwt_access_secret as string,
        ) as JwtPayload;
      } catch (error) {
        // if invalid token then ignore and continue as guest
        return next();
      }

      const { email, role, iat } = decoded;

      const user = await User.findOne({ email, role });

      // if user not found or blocked then treat as guest
      if (!user || user.status === "blocked" || user.isDeleted) {
        return next();
      }

      // check if token issued before password change
      if (
        user.passwordChangedAt &&
        User.isJWTIssuedBeforePasswordChange(
          user.passwordChangedAt,
          iat as number,
        )
      ) {
        // no problem, we treat it as guest user
        return next();
      }

      // and finally, we found the authenticate user.
      // we set the decoded info into the request object
      req.user = decoded;
      next();
    },
  );
};

export default optionalAuth;
