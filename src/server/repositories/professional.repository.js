import { prisma } from "../db/client";

const PROFESSIONAL_INCLUDE = {
  user: { select: { name: true, email: true } },
  skills: { include: { skill: true } },
  trustBadges: true,
  portfolioImages: true,
  services: true,
};

export function findMany({ trade, search, minRate, maxRate, minRating } = {}) {
  return prisma.professional.findMany({
    where: {
      ...(trade ? { trade: { in: trade } } : {}),
      ...(minRate != null || maxRate != null
        ? {
            hourlyRate: {
              ...(minRate != null ? { gte: minRate } : {}),
              ...(maxRate != null ? { lte: maxRate } : {}),
            },
          }
        : {}),
      ...(minRating != null ? { ratingAvg: { gte: minRating } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { trade: { contains: search, mode: "insensitive" } },
              { user: { name: { contains: search, mode: "insensitive" } } },
              { skills: { some: { skill: { name: { contains: search, mode: "insensitive" } } } } },
            ],
          }
        : {}),
    },
    include: PROFESSIONAL_INCLUDE,
    orderBy: { ratingAvg: "desc" },
  });
}

export function findById(id) {
  return prisma.professional.findUnique({
    where: { id },
    include: PROFESSIONAL_INCLUDE,
  });
}

export function findByUserId(userId) {
  return prisma.professional.findUnique({
    where: { userId },
    include: PROFESSIONAL_INCLUDE,
  });
}

export async function create(userId, data) {
  const { skills = [], trustBadges = [], servicesOffered = [], ...professionalFields } = data;

  return prisma.professional.create({
    data: {
      userId,
      ...professionalFields,
      skills: {
        create: await Promise.all(
          skills.map(async (name) => ({
            skill: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          }))
        ),
      },
      trustBadges: { create: trustBadges.map((label) => ({ label })) },
      services: { create: servicesOffered },
    },
    include: PROFESSIONAL_INCLUDE,
  });
}

export function update(id, data) {
  return prisma.professional.update({
    where: { id },
    data,
    include: PROFESSIONAL_INCLUDE,
  });
}

export function remove(id) {
  return prisma.professional.delete({ where: { id } });
}
