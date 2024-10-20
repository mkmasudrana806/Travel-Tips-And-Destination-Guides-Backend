import httpStatus from "http-status";
import asyncHanlder from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { PaymentServices } from "./payment.service";

// -------------  upgrade user to premiumAccess
const upgradeUserToPremium = asyncHanlder(async (req, res) => {
  const { tnxId, userId, status } = req?.query;

  // double check if payment success in amarpay then update payment status and user premiumAccess status

  await PaymentServices.upgradeUserToPremiumIntoDB(
    tnxId as string,
    userId as string,
    status as string
  );

  res.send(`<h1>Payment ${status}</h1>`);
});

// -------------  upgrade user to verified
const upgradeUserToVerified = asyncHanlder(async (req, res) => {
  const { tnxId, userId, status } = req?.query;

  // double check if payment success in amarpay then update payment status and user premiumAccess status

  await PaymentServices.upgradeUserToVerifiedIntoDB(
    tnxId as string,
    userId as string,
    status as string
  );

  res.send(`<h1>Payment ${status}</h1>`);
});

// get all payments history
const allPaymentHistory = asyncHanlder(async (req, res) => {
  const result = await PaymentServices.allPaymentsHistoryFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "payments history retrieved successfull",
    data: result,
  });
});

// get user payment history
const userPaymentHistory = asyncHanlder(async (req, res) => {
  const result = await PaymentServices.userPaymentsHistoryFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User payments history retrieved successfull",
    data: result,
  });
});

// update payment status
const updatePaymentStatus = asyncHanlder(async (req, res) => {
  const result = await PaymentServices.updatePaymentStatusIntoDB(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment status updated successfull",
    data: result,
  });
});

export const PaymentControllers = {
  upgradeUserToPremium,
  upgradeUserToVerified,
  allPaymentHistory,
  userPaymentHistory,
  updatePaymentStatus,
};
