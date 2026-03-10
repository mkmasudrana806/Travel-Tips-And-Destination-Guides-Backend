import app from "./app";
import config from "./app/config";
import mongoose from "mongoose";
import seedAdmin from "./app/DB";

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(config.database_url as string);
    console.log("Database connected");

    await seedAdmin();

    isConnected = true;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw error;
  }
}

// for localhost
if (process.env.NODE_ENV !== "production") {
  connectDB().then(() => {
    app.listen(config.app_port, () => {
      console.log(
        `🚀 Local server running at http://localhost:${config.app_port}`,
      );
    });
  });
}

// This wrapper ensures DB is connected before Express handles the request
const handler = async (req: any, res: any) => {
  await connectDB();
  return app(req, res);
};

export default handler;
