import { z } from "zod";

export const createPaymentSchema = z.object({
  bookingId: z.string().min(1),
  amount: z.coerce.number().positive(),
  method: z.enum(["upi", "card"]).optional(),
});
