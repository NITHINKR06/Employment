import { prisma } from "../db/client";

export function findByBookingId(bookingId) {
  return prisma.review.findUnique({ where: { bookingId } });
}

export function create({ bookingId, rating, comment }) {
  return prisma.review.create({ data: { bookingId, rating, comment } });
}

export function findManyByProfessionalId(professionalId) {
  return prisma.review.findMany({
    where: { booking: { professionalId } },
    include: { booking: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function aggregateForProfessional(professionalId) {
  const result = await prisma.review.aggregate({
    where: { booking: { professionalId } },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return { avg: result._avg.rating ?? 0, count: result._count.rating };
}
