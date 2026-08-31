import * as professionalRepository from "../repositories/professional.repository";
import { NotFoundError, ForbiddenError } from "../utils/errors";

function toPublicShape(professional) {
  return {
    id: professional.id,
    name: professional.user.name,
    title: professional.title,
    trade: professional.trade,
    yearsExperience: professional.yearsExperience,
    rating: Number(professional.ratingAvg),
    reviewCount: professional.reviewCount,
    hourlyRate: Number(professional.hourlyRate),
    avatar: professional.avatar,
    verified: professional.verified,
    location: professional.location,
    latitude: professional.latitude != null ? Number(professional.latitude) : null,
    longitude: professional.longitude != null ? Number(professional.longitude) : null,
    availability: professional.availability,
    skills: professional.skills.map((ps) => ps.skill.name),
    bio: professional.bio,
    experienceSummary: professional.experienceSummary,
    trustBadges: professional.trustBadges.map((b) => b.label),
    portfolio: professional.portfolioImages.map((p) => p.url),
    servicesOffered: professional.services.map((s) => ({
      id: s.id,
      title: s.title,
      subtext: s.subtext,
      price: s.price != null ? Number(s.price) : null,
    })),
  };
}

export async function listProfessionals(filters) {
  const professionals = await professionalRepository.findMany(filters);
  return professionals.map(toPublicShape);
}

export async function getProfessionalById(id) {
  const professional = await professionalRepository.findById(id);
  if (!professional) throw new NotFoundError("Professional not found");
  return toPublicShape(professional);
}

export async function getMyProfessional(user) {
  const professional = await professionalRepository.findByUserId(user.id);
  if (!professional) return null;
  return { ...toPublicShape(professional), email: professional.user.email };
}

export async function createProfessional(user, data) {
  const existing = await professionalRepository.findByUserId(user.id);
  if (existing) {
    throw new ForbiddenError("A professional profile already exists for this account");
  }
  const professional = await professionalRepository.create(user.id, data);
  return toPublicShape(professional);
}

export async function updateProfessional(user, id, data) {
  const professional = await professionalRepository.findById(id);
  if (!professional) throw new NotFoundError("Professional not found");
  if (professional.userId !== user.id && user.role !== "ADMIN") {
    throw new ForbiddenError();
  }
  const updated = await professionalRepository.update(id, data);
  return toPublicShape(updated);
}

export async function deleteProfessional(user, id) {
  const professional = await professionalRepository.findById(id);
  if (!professional) throw new NotFoundError("Professional not found");
  if (professional.userId !== user.id && user.role !== "ADMIN") {
    throw new ForbiddenError();
  }
  await professionalRepository.remove(id);
}
