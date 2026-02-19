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

// ------------- on payment cancelled by user -------------
const onPaymentCancelled = asyncHanlder(async (req, res) => {
  const { cus_email, mer_txnid } = req.body;
  const result = await PaymentServices.onPaymentCancelled(cus_email, mer_txnid);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment is cancelled successfully",
    data: result,
  });
});

// get all payments history
const allPaymentHistory = asyncHanlder(async (req, res) => {
  const query = req.query;
  const { data, meta } = await PaymentServices.allPaymentsHistoryFromDB(query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "payments history retrieved successfull",
    data: data,
  });
});

// ----------- get my payment history -----------
const myPaymentHistory = asyncHanlder(async (req, res) => {
  const userId = req.user.userId;
  const result = await PaymentServices.myPaymentsHistory(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My payments history retrieved successfull",
    data: result,
  });
});

export const PaymentControllers = {
  getSubscriptionSession,
  onPaymentSuccess,
  onPaymentFailed,
  onPaymentCancelled,
  myPaymentHistory,
  allPaymentHistory,
};
