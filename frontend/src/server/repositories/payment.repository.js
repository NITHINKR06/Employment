import { prisma } from "../db/client";

export function findByBookingId(bookingId) {
  return prisma.payment.findUnique({ where: { bookingId } });
}

export function findById(id) {
  return prisma.payment.findUnique({ where: { id }, include: { booking: true } });
}

export function createPaid({ bookingId, amount, provider, providerRef }) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: { bookingId, amount, status: "PAID", provider, providerRef },
    });

    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (booking.status === "PENDING") {
      await tx.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } });
    }

    return payment;
  });
}
