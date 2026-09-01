import { payForBooking } from "@/server/services/payment.service";
import { requireAuth } from "@/server/auth/requireAuth";
import { ok, withErrorHandling } from "@/server/utils/apiResponse";
import { ValidationError } from "@/server/utils/errors";
import { createPaymentSchema } from "@/server/validators/payment.schema";

export const POST = withErrorHandling(async (request) => {
  const user = await requireAuth();

  const parsed = createPaymentSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    throw new ValidationError("Invalid payment data", parsed.error.flatten());
  }

  const payment = await payForBooking(user, parsed.data);
  return ok({ payment }, 201);
});
