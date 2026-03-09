import app from "./app";
import config from "./app/config";
import mongoose from "mongoose";
import seedAdmin from "./app/DB";
import { Request, Response } from "express";

let isConnected = false;

// connect database and seed admin
async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(config.database_url as string);
  console.log("Database connected");

  await seedAdmin();

  isConnected = true;
}

export default async function handler(req: Request, res: Response) {
  await connectDB();
  return app(req, res);
}
