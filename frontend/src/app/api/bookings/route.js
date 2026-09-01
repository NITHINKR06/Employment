import { createBooking, listMyBookings } from "@/server/services/booking.service";
import { requireAuth } from "@/server/auth/requireAuth";
import { ok, withErrorHandling } from "@/server/utils/apiResponse";
import { ValidationError } from "@/server/utils/errors";
import { createBookingSchema } from "@/server/validators/booking.schema";

export const GET = withErrorHandling(async () => {
  const user = await requireAuth();
  const bookings = await listMyBookings(user);
  return ok({ bookings });
});

export const POST = withErrorHandling(async (request) => {
  const user = await requireAuth();

  const parsed = createBookingSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    throw new ValidationError("Invalid booking data", parsed.error.flatten());
  }

  const booking = await createBooking(user, parsed.data);
  return ok({ booking }, 201);
});
