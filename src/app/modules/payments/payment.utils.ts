import dotenv from "dotenv";
import axios from "axios";
import { TPayment } from "./payment.interface";

dotenv.config();

// --------------- initiate amarpay payment object
export const initiatePayment = async (
  paymentData: Partial<TPayment>,
  success_url: string,
  fail_url: string,
  cancel_url: string,
) => {
  const response = await axios.post(process.env.PAYMENT_URL as string, {
    store_id: process.env.STORE_ID,
    signature_key: process.env.SIGNATURE_KEY,
    tran_id: paymentData.transactionId,
    success_url: success_url,
    fail_url: fail_url,
    cancel_url: cancel_url,
    amount: paymentData.amount,
    currency: "BDT",
    desc: "Merchant Registration Payment",
    cus_name: paymentData.username,
    cus_email: paymentData.email,
    cus_country: "Bangladesh",
    cus_phone: "N/A",
    type: "json",
  });

  return response.data;
};

// verify payment
export const verifyPayment = async (tnxId: string) => {
  const response = await axios.get(process.env.PAYMENT_VERIFY_URL as string, {
    params: {
      store_id: process.env.STORE_ID,
      signature_key: process.env.SIGNATURE_KEY,
      type: "json",
      request_id: tnxId,
    },
  });

  return response.data;
};
