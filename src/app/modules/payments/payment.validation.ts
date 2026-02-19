import { z } from "zod";

// initiate subscription session
const getSubscriptionSchema = z.object({
  body: z
    .object({
      amount: z.number({ required_error: "Amount is required" }),
      subscriptionType: z.enum(["monthly", "yearly"]),
    })
    .strict(),
});

// on sucess payment, update the status
const onPaymentSuccessSchema = z.object({
  body: z.object({
    cus_email: z.string({ required_error: "Customer email is required" }),
    mer_txnid: z.string({ required_error: "Transaction ID is required" }),
  }),
});

// update payment status
const updatePaymentStatusSchema = z.object({
  body: z.object({
    status: z.enum(["completed"]),
  }),
});

export const PaymentValidations = {
  getSubscriptionSchema,
  onPaymentSuccessSchema,
  updatePaymentStatusSchema,
};
