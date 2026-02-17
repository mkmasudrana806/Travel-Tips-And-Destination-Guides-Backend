import { Payment } from "./payment.model";
import { verifyPayment } from "./payment.utils";
import mongoose from "mongoose";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { User } from "../user/user.model";
import { TJwtPayload } from "../../interface/JwtPayload";

// --------------- upgrade user to premiumAccess and payment status to "completed"
const upgradeUserToPremiumIntoDB = async (
  tnxId: string,
  userId: string,
  status: string
) => {
  if (status === "failed") {
    // update payment status
    const paymentStatus = await Payment.findOneAndUpdate(
      { transactionId: tnxId },
      { status: "failed" },
      { runValidators: true }
    );

    if (!paymentStatus) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Faild to update payment status"
      );
    }
    return;
  }
  // first verify payment in amarpay database
  const isPaidtoAmarpay = await verifyPayment(tnxId);

  // now update payment status and user premiumAccess
  if (isPaidtoAmarpay && isPaidtoAmarpay.pay_status === "Successful") {
    const session = await mongoose.startSession();
    try {
      // start transaction
      session.startTransaction();

      // update payment status
      const paymentStatus = await Payment.findOneAndUpdate(
        { transactionId: tnxId },
        { status: "completed" },
        { runValidators: true, session }
      );

      if (!paymentStatus) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Faild to update payment status"
        );
      }

      // update user premiumAccess
      const userPremiumAccess = await User.findByIdAndUpdate(
        userId,
        { premiumAccess: true },
        { session }
      );
      if (!userPremiumAccess) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Failed to update user premiumAccess"
        );
      }
      await session.commitTransaction();
      await session.endSession();
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Faild to upgrade payment"
      );
    }
  }
};

// --------------- upgrade user to verified
const upgradeUserToVerifiedIntoDB = async (
  tnxId: string,
  userId: string,
  status: string
) => {
  if (status === "failed") {
    // update payment status
    const paymentStatus = await Payment.findOneAndUpdate(
      { transactionId: tnxId },
      { status: "failed" },
      { runValidators: true }
    );

    if (!paymentStatus) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Faild to update payment status"
      );
    }
    return;
  }
  // first verify payment in amarpay database
  const isPaidtoAmarpay = await verifyPayment(tnxId);

  // now update payment status and user premiumAccess
  if (isPaidtoAmarpay && isPaidtoAmarpay.pay_status === "Successful") {
    const session = await mongoose.startSession();
    try {
      // start transaction
      session.startTransaction();

      // update payment status
      const paymentStatus = await Payment.findOneAndUpdate(
        { transactionId: tnxId },
        { status: "completed" },
        { runValidators: true, session }
      );

      if (!paymentStatus) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Faild to update payment status"
        );
      }

      // update user premiumAccess
      const userPremiumAccess = await User.findByIdAndUpdate(
        userId,
        { isVerified: true },
        { session }
      );
      if (!userPremiumAccess) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Failed to update user premiumAccess"
        );
      }

      await session.commitTransaction();
      await session.endSession();
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Faild to upgrade payment"
      );
    }
  }
};

// get all payments history
const allPaymentsHistoryFromDB = async () => {
  const result = await Payment.find({});
  return result;
};

// get user payments history
const userPaymentsHistoryFromDB = async (userData: TJwtPayload) => {
  const result = await Payment.find({ userId: userData.userId });
  return result;
};

// update payments status
const updatePaymentStatusIntoDB = async (
  id: string,
  payload: { status: string }
) => {
  const result = await Payment.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

export const PaymentServices = {
  upgradeUserToPremiumIntoDB,
  upgradeUserToVerifiedIntoDB,
  allPaymentsHistoryFromDB,
  userPaymentsHistoryFromDB,
  updatePaymentStatusIntoDB,
};
