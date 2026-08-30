import { prisma } from "../db/client";

const BOOKING_INCLUDE = {
  user: { select: { id: true, name: true, email: true } },
  professional: {
    include: { user: { select: { id: true, name: true, email: true } } },
  },
  service: true,
  payment: true,
};

export function create(data) {
  return prisma.booking.create({
    data,
    include: BOOKING_INCLUDE,
  });
}

export function findById(id) {
  return prisma.booking.findUnique({
    where: { id },
    include: BOOKING_INCLUDE,
  });
}

export function findManyByUserId(userId) {
  return prisma.booking.findMany({
    where: { userId },
    include: BOOKING_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

export function findManyByProfessionalId(professionalId) {
  return prisma.booking.findMany({
    where: { professionalId },
    include: BOOKING_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

export function updateStatus(id, status) {
  return prisma.booking.update({
    where: { id },
    data: { status },
    include: BOOKING_INCLUDE,
  });
}
