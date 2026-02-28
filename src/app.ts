import { Request, Response } from "express";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { ApiRoutes } from "./app/routes";
import notFoundRoute from "./app/middlewares/notFoundRoute";
import globalErrorHandler from "./app/middlewares/globalErrorHandlerRoute";
import mongoSanitize from "express-mongo-sanitize";

const app = express();

// security headers
app.use(helmet());
app.disable("x-powered-by");

// body parser
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true, limit: "200kb" }));

// security sanitizer
app.use(mongoSanitize());

app.use(
  cors({
    // origin: ["https://travel-tips-and-destination-guides-client.vercel.app"],
    origin:
      process.env.NODE_ENV === "development"
        ? ["http://localhost:3000"]
        : ["https://travelshare.vercel.com"],
    credentials: true,
  }),
); // your client url
app.use(cookieParser());
app.use(express.static("./uploads"));

// api routes (middleware)
app.use("/api/v1", ApiRoutes);

// base api route
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running...");
});

// not found route
app.use("*", notFoundRoute);

// global error handler
app.use(globalErrorHandler);

export default app;
