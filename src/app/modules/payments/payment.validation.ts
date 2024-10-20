import { z } from "zod";

// make a payment validation schema
const paymentValidationSchema = z.object({
  body: z.object({
    amount: z.number({ required_error: "Amount is required" }),
    subscriptionType: z.enum(["monthly", "yearly"]),
  }),
});

// update payment status
const updatePaymentStatusSchema = z.object({
  body: z.object({
    status: z.enum(["completed"]),
  }),
});

export const PaymentValidations = {
  paymentValidationSchema,
  updatePaymentStatusSchema,
};
