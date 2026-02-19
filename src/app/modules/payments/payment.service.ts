import { Payment } from "./payment.model";
import { initiatePayment, verifyPayment } from "./payment.utils";
import mongoose from "mongoose";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { User } from "../user/user.model";
import { TJwtPayload } from "../../interface/JwtPayload";
import { TPayment } from "./payment.interface";

/**
 * -------------------- get Premium content Access ----------------------
 *
 * Uubscribe premium content (monthly/yearly). Access premium post content
 * @param user user jwt payload
 * @param payload boolean payload
 */
const getSubscription = async (userId: string, payload: TPayment) => {
  // check if user exist
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User is not found!");
  }

  // payment data
  const tnxId = `tnx-${Date.now()}`;
  const paymentData: Partial<TPayment> = {
    userId: new mongoose.Types.ObjectId(userId),
    username: user.name,
    email: user.email,
    amount: payload.amount,
    subscriptionType: payload.subscriptionType,
    transactionId: tnxId,
  };

  // set subscription expires date
  const expiredDate = new Date();
  if (paymentData.subscriptionType === "monthly") {
    expiredDate.setDate(expiredDate.getDate() + 30);
  } else if (paymentData.subscriptionType === "yearly") {
    expiredDate.setDate(expiredDate.getDate() + 365);
  }
  paymentData.expiresIn = expiredDate as unknown as Date;

  //  save payment info to DB
  const result = await Payment.create(paymentData);
  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Faild to create payment",
    );
  }

  const successUrl = `https://travel-tips-and-destination-guides-backend.vercel.app/api/payments/upgrade-user?tnxId=${paymentData.transactionId}&userId=${paymentData.userId}&status=success`;

  const faildUrl = `https://travel-tips-and-destination-guides-backend.vercel.app/api/payments/upgrade-user?tnxId=${paymentData.transactionId}&userId=${paymentData.userId}&status=failed`;

  //  initiate amarPay session and return session url
  const session = await initiatePayment(paymentData, successUrl, faildUrl);
  return session;
};

// --------------- upgrade user to premiumAccess and payment status to "completed"
const upgradeUserToPremiumIntoDB = async (
  tnxId: string,
  userId: string,
  status: string,
) => {
  if (status === "failed") {
    // update payment status
    const paymentStatus = await Payment.findOneAndUpdate(
      { transactionId: tnxId },
      { status: "failed" },
      { runValidators: true },
    );

    if (!paymentStatus) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Faild to update payment status",
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
        { runValidators: true, session },
      );

      if (!paymentStatus) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Faild to update payment status",
        );
      }

      // update user premiumAccess
      const userPremiumAccess = await User.findByIdAndUpdate(
        userId,
        { premiumAccess: true },
        { session },
      );
      if (!userPremiumAccess) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Failed to update user premiumAccess",
        );
      }
      await session.commitTransaction();
      await session.endSession();
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Faild to upgrade payment",
      );
    }
  }
};

// --------------- upgrade user to verified
const upgradeUserToVerifiedIntoDB = async (
  tnxId: string,
  userId: string,
  status: string,
) => {
  if (status === "failed") {
    // update payment status
    const paymentStatus = await Payment.findOneAndUpdate(
      { transactionId: tnxId },
      { status: "failed" },
      { runValidators: true },
    );

    if (!paymentStatus) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Faild to update payment status",
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
        { runValidators: true, session },
      );

      if (!paymentStatus) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Faild to update payment status",
        );
      }

      // update user premiumAccess
      const userPremiumAccess = await User.findByIdAndUpdate(
        userId,
        { isVerified: true },
        { session },
      );
      if (!userPremiumAccess) {
        throw new AppError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Failed to update user premiumAccess",
        );
      }

      await session.commitTransaction();
      await session.endSession();
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Faild to upgrade payment",
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
  payload: { status: string },
) => {
  const result = await Payment.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

export const PaymentServices = {
  getSubscription,
  upgradeUserToPremiumIntoDB,
  upgradeUserToVerifiedIntoDB,
  allPaymentsHistoryFromDB,
  userPaymentsHistoryFromDB,
  updatePaymentStatusIntoDB,
};
