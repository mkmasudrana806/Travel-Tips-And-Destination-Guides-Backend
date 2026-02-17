import { TJwtPayload } from "./JwtPayload";

// add user property to Request object
declare global {
  namespace Express {
    interface Request {
      user: TJwtPayload;
    }
  }
}
