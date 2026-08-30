import { randomUUID } from "crypto";
import * as paymentRepository from "../repositories/payment.repository";
import * as bookingRepository from "../repositories/booking.repository";
import { NotFoundError, ForbiddenError, ValidationError } from "../utils/errors";

// NOTE: this is a mock/dummy payment provider — it marks payments PAID
// immediately with no real gateway call. Swap createPaid's provider/providerRef
// generation for a real gateway integration (Stripe, Razorpay, etc.) later;
// nothing else in this service needs to change.
function toPublicShape(payment) {
  return {
    id: payment.id,
    bookingId: payment.bookingId,
    amount: Number(payment.amount),
    status: payment.status,
    provider: payment.provider,
    providerRef: payment.providerRef,
    createdAt: payment.createdAt,
  };
}

export async function payForBooking(user, { bookingId, amount, method }) {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found");
  if (booking.userId !== user.id) throw new ForbiddenError("This booking does not belong to you");

  const existing = await paymentRepository.findByBookingId(bookingId);
  if (existing) throw new ValidationError("This booking has already been paid for");

  const payment = await paymentRepository.createPaid({
    bookingId,
    amount,
    provider: `mock-${method ?? "upi"}`,
    providerRef: `MOCK-${randomUUID()}`,
  });

  return toPublicShape(payment);
}

export async function getPaymentById(user, id) {
  const payment = await paymentRepository.findById(id);
  if (!payment) throw new NotFoundError("Payment not found");
  if (payment.booking.userId !== user.id && user.role !== "ADMIN") {
    throw new ForbiddenError();
  }
  return toPublicShape(payment);
}
