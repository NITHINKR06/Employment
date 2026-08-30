import { getBookingById, updateBookingStatus } from "@/server/services/booking.service";
import { requireAuth } from "@/server/auth/requireAuth";
import { ok, withErrorHandling } from "@/server/utils/apiResponse";
import { ValidationError } from "@/server/utils/errors";
import { updateBookingStatusSchema } from "@/server/validators/booking.schema";

export const GET = withErrorHandling(async (_request, { params }) => {
  const { id } = await params;
  const user = await requireAuth();
  const booking = await getBookingById(user, id);
  return ok({ booking });
});

export const PATCH = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const user = await requireAuth();

  const parsed = updateBookingStatusSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    throw new ValidationError("Invalid status", parsed.error.flatten());
  }

  const booking = await updateBookingStatus(user, id, parsed.data.status);
  return ok({ booking });
});
