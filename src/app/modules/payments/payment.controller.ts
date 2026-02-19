import httpStatus from "http-status";
import asyncHanlder from "../../utils/asyncHandler";
import sendResponse from "../../utils/sendResponse";
import { PaymentServices } from "./payment.service";
import config from "../../config";

// ------------------- get premium content access -------------------
const getSubscriptionSession = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;
  const result = await PaymentServices.getSubscriptionSession(userId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "amarPay session is initiated successfully",
    data: result,
  });
});

// ------------- on payment success -------------
const onPaymentSuccess = asyncHanlder(async (req, res) => {
  const { cus_email, mer_txnid } = req.body;
  await PaymentServices.onPaymentSuccess(cus_email, mer_txnid);

  // after updating payment status in database. now redirect user to frontend with txnId as params. so that frontend can call backend to find out the status of the payment by txnId.
  res.redirect(`${config.frontend_url}/payments/success?txnId=${mer_txnid}`);
});

// ------------- on payment failed -------------
const onPaymentFailed = asyncHanlder(async (req, res) => {
  const { cus_email, mer_txnid } = req.body;
  await PaymentServices.onPaymentFailed(cus_email, mer_txnid);

  // after updating payment status as failed. now redirect user to the frontend
  res.redirect(`${config.frontend_url}/payments/failed?txnId=${mer_txnid}`);
});

// -------------  upgrade user to verified
const upgradeUserToVerified = asyncHanlder(async (req, res) => {
  const { tnxId, userId, status } = req?.query;

  // double check if payment success in amarpay then update payment status and user premiumAccess status

  await PaymentServices.upgradeUserToVerifiedIntoDB(
    tnxId as string,
    userId as string,
    status as string,
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
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment status updated successfull",
    data: result,
  });
});

export const PaymentControllers = {
  getSubscriptionSession,
  onPaymentSuccess,
  onPaymentFailed,
  upgradeUserToVerified,
  allPaymentHistory,
  userPaymentHistory,
  updatePaymentStatus,
};
