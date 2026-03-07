import { Payment } from "./payment.model";
import { initiatePayment, verifyPayment } from "./payment.utils";
import mongoose from "mongoose";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";
import { User } from "../user/user.model";
import { TPayment } from "./payment.interface";
import config from "../../config";
import QueryBuilder from "../../queryBuilder/queryBuilder";
import { PAYMENT_QUERY_OPTIONS } from "./payment.query";

/**
 * -------------------- initiate subscriptions session ----------------------
 *
 * Initiate aamarPay payment session for subscriptions premium content (monthly/yearly)
 * @param userId user who want to get premium subscription
 * @param payload boolean payload
 */
const getSubscriptionSession = async (userId: string, payload: TPayment) => {
  // check if user exist
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User is not found!");
  }

  // check if user already has premium access. or payment pending/completed
  // in same month with completed or pending status is not allowed in this api route
  // for upgrade plan user have to use upgrade plan api route
  const existingPayment = await Payment.findOne({
    userId,
    status: { $in: ["pending", "completed"] },
  }).sort({ paymentDate: -1 });

  if (existingPayment && existingPayment.status === "pending") {
    throw new AppError(400, "Payment already in progress");
  }

  if (
    existingPayment &&
    existingPayment.status === "completed" &&
    existingPayment.expiresAt > new Date()
  ) {
    throw new AppError(400, "Active subscription already exists");
  }

  // payment data
  const tnxId = `tnx-${Date.now()}`;
  const paymentData: Partial<TPayment> = {
    user: new mongoose.Types.ObjectId(userId),
    username: user.name,
    email: user.email,
    amount: payload.amount,
    subscriptionType: payload.subscriptionType,
    transactionId: tnxId,
  };

  // expiresAt calculation
  const now = new Date();
  let expiresAt: Date = new Date(now);
  if (paymentData.subscriptionType === "monthly") {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else if (paymentData.subscriptionType === "yearly") {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }
  paymentData.expiresAt = expiresAt;

  //  save payment info to DB
  const result = await Payment.create(paymentData);
  if (!result) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Faild to create payment",
    );
  }

  /*
  Note: as this is a practice project. I am not implementing aamarPay webhook to update payment status. I am updating payment status when frontend url is redirected, at the same time i will call backend. which is not a good practice for production level project. as it can be easily manipulated by the user. but for this project it is fine.
  in production level project we have to implement aamarPay webhook to update payment status. and in the callback url we have to verify payment status from aamarPay database and then update payment status in our database.
  */

  const successUrl = `${config.backend_url}/subscriptions/success`;
  const faildUrl = `${config.backend_url}/subscriptions/failed`;
  const cancelUrl = `${config.backend_url}/subscriptions/cancelled?txnId=${tnxId}&userId=${userId}`;

  //  initiate amarPay session and return session url
  const session = await initiatePayment(
    paymentData,
    successUrl,
    faildUrl,
    cancelUrl,
  );
  return session;
};

/**
 * --------------- on payment success------------------
 *
 * @param userEmail user email who paid
 * @param txnId transaction Id of the payment
 */
const onPaymentSuccess = async (userEmail: string, txnId: string) => {
  // check transaction id and user email exist in database with pending status
  const payment = await Payment.findOne({
    transactionId: txnId,
    email: userEmail,
    status: "pending",
  });

  if (!payment) {
    throw new AppError(httpStatus.FORBIDDEN, "Payment data is not available");
  }

  // first verify payment in amarpay database
  const isPaidtoAmarpay = await verifyPayment(txnId);

  // now update payment status and give user premiumAccess
  if (isPaidtoAmarpay && isPaidtoAmarpay.pay_status === "Successful") {
    const session = await mongoose.startSession();
    try {
      // start transaction
      session.startTransaction();
      // update payment status
      const paymentStatus = await Payment.findOneAndUpdate(
        { transactionId: txnId, email: userEmail, status: "pending" },
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
      const userPremiumAccess = await User.findOneAndUpdate(
        { email: userEmail },
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

/**
 * --------------- on payment failed------------------
 *
 * @param userEmail user email who's payment is failed
 * @param txnId transaction Id of the failed payment
 */
const onPaymentFailed = async (userEmail: string, txnId: string) => {
  // check transaction id and user email exist in database with pending status
  const payment = await Payment.findOne({
    transactionId: txnId,
    email: userEmail,
    status: "pending",
  });

  if (!payment) {
    throw new AppError(httpStatus.FORBIDDEN, "Payment data is not available");
  }

  // first verify payment in amarpay database
  const isPaidtoAmarpay = await verifyPayment(txnId);

  if (isPaidtoAmarpay && isPaidtoAmarpay.pay_status === "Failed") {
    // update payment status to failed
    const paymentStatus = await Payment.findOneAndUpdate(
      { transactionId: txnId, email: userEmail, status: "pending" },
      { status: "failed" },
      { runValidators: true },
    );

    if (!paymentStatus) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Faild to update payment status",
      );
    }
  }
};

/**
 * --------------- on payment cancelled ------------------
 *
 * @param userEmail user email who's payment is failed
 * @param txnId transaction Id of the failed payment
 */
const onPaymentCancelled = async (userEmail: string, txnId: string) => {
  // check transaction id and user email exist in database with pending status
  const payment = await Payment.findOne({
    transactionId: txnId,
    email: userEmail,
    status: "pending",
  });

  if (!payment) {
    throw new AppError(httpStatus.FORBIDDEN, "Payment data is not available");
  }

  // first verify payment in amarpay database
  const isPaidtoAmarpay = await verifyPayment(txnId);

  if (isPaidtoAmarpay && isPaidtoAmarpay.pay_status === "Cancelled") {
    // update payment status to failed
    const paymentStatus = await Payment.findOneAndUpdate(
      { transactionId: txnId, email: userEmail, status: "pending" },
      { status: "cancelled" },
      { runValidators: true },
    );

    if (!paymentStatus) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Faild to update payment status",
      );
    }

    return paymentStatus;
  }
};

// get all payments history
const allPaymentsHistory = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(
    Payment.find(),
    query,
    PAYMENT_QUERY_OPTIONS,
  )
    .search()
    .filter()
    .sort()
    .fieldsLimiting()
    .paginate()
    .lean();

  const data = await queryBuilder.modelQuery;
  const meta = await queryBuilder.countTotal(true);

  return {
    meta,
    data,
  };
};

/**
 * ----------- get my payments history -----------
 *
 * @param userId userId who want to see his all payment history
 * @returns latest 20 payments history of the user
 */
const myPaymentsHistory = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const queryBuilder = new QueryBuilder(
    Payment.find({ user: userId }),
    query,
    PAYMENT_QUERY_OPTIONS,
  )
    .search()
    .filter()
    .sort()
    .fieldsLimiting()
    .paginate()
    .lean();

  const data = await queryBuilder.modelQuery;
  const meta = await queryBuilder.countTotal();

  return {
    meta,
    data,
  };
};

export const PaymentServices = {
  getSubscriptionSession,
  onPaymentSuccess,
  onPaymentFailed,
  onPaymentCancelled,
  allPaymentsHistory,
  myPaymentsHistory,
};
