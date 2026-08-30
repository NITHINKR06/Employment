import { getPaymentById } from "@/server/services/payment.service";
import { requireAuth } from "@/server/auth/requireAuth";
import { ok, withErrorHandling } from "@/server/utils/apiResponse";

export const GET = withErrorHandling(async (_request, { params }) => {
  const { id } = await params;
  const user = await requireAuth();
  const payment = await getPaymentById(user, id);
  return ok({ payment });
});
