import dotenv from "dotenv";
import axios from "axios";
import { TPayment } from "./payment.interface";

dotenv.config();

// --------------- initiate amarpay payment object
export const initiatePayment = async (paymentData: Partial<TPayment>) => {
  const response = await axios.post(process.env.PAYMENT_URL as string, {
    store_id: process.env.STORE_ID,
    signature_key: process.env.SIGNATURE_KEY,
    tran_id: paymentData.transactionId,
    success_url: `http://localhost:5000/api/payments/upgrade-user?tnxId=${paymentData.transactionId}&userId=${paymentData.userId}&status=success`,
    fail_url: `http://localhost:5000/api/payments/upgrade-user?tnxId=${paymentData.transactionId}&userId=${paymentData.userId}&status=failed`,
    cancel_url: "http://localhost:3000/",
    amount: paymentData.amount,
    currency: "BDT",
    desc: "Merchant Registration Payment",
    cus_name: paymentData?.username,
    cus_email: paymentData?.email,
    cus_add1: "N/A",
    cus_add2: "N/A",
    cus_city: "N/A",
    cus_state: "N/A",
    cus_postcode: "N/A",
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
