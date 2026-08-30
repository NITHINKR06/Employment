import * as bookingRepository from "../repositories/booking.repository";
import * as professionalRepository from "../repositories/professional.repository";
import { NotFoundError, ForbiddenError, ValidationError } from "../utils/errors";

const STATUS_LABELS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function avatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00855d&color=fff&size=128&bold=true`;
}

function splitScheduledAt(scheduledAt) {
  if (!scheduledAt) return { date: null, time: null };
  const d = new Date(scheduledAt);
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

function toSummaryShape(booking, viewerRole) {
  const isEmployeeView = viewerRole === "EMPLOYEE";
  const counterpartName = isEmployeeView ? booking.user.name : booking.professional.user.name;
  const counterpartAvatar = isEmployeeView ? avatarUrl(booking.user.name) : booking.professional.avatar;
  const { date, time } = splitScheduledAt(booking.scheduledAt);

  return {
    _id: booking.id,
    name: counterpartName,
    experience: booking.professional.yearsExperience,
    status: STATUS_LABELS[booking.status],
    rating: isEmployeeView ? null : Number(booking.professional.ratingAvg),
    serviceTitle: booking.service?.title ?? booking.professional.title,
    workerAvatar: counterpartAvatar,
    thumbnail: counterpartAvatar,
    date,
    time,
    address: booking.address,
    notes: booking.notes,
    amount: booking.payment ? Number(booking.payment.amount) : null,
    paymentStatus: booking.payment?.status ?? null,
    reviewed: Boolean(booking.review),
  };
}

function assertParticipant(booking, user) {
  const isOwner = booking.userId === user.id;
  const isProfessional = booking.professional.userId === user.id;
  if (!isOwner && !isProfessional && user.role !== "ADMIN") {
    throw new ForbiddenError();
  }
  return { isOwner, isProfessional };
}

export async function createBooking(user, data) {
  const professional = await professionalRepository.findById(data.professionalId);
  if (!professional) throw new NotFoundError("Professional not found");

  if (data.serviceId && !professional.services.some((s) => s.id === data.serviceId)) {
    throw new ValidationError("Service does not belong to this professional");
  }

  const booking = await bookingRepository.create({
    userId: user.id,
    professionalId: professional.id,
    serviceId: data.serviceId ?? null,
    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    address: data.address,
    notes: data.notes,
  });

  return toSummaryShape(booking, user.role);
}

export async function getEmployeeSummary(user) {
  const professional = await professionalRepository.findByUserId(user.id);
  if (!professional) {
    return { totalJobs: 0, upcomingJobs: 0, completedJobs: 0, cancelledJobs: 0, totalEarnings: 0 };
  }

  const bookings = await bookingRepository.findManyByProfessionalId(professional.id);

  return {
    totalJobs: bookings.length,
    upcomingJobs: bookings.filter((b) => ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status)).length,
    completedJobs: bookings.filter((b) => b.status === "COMPLETED").length,
    cancelledJobs: bookings.filter((b) => b.status === "CANCELLED").length,
    totalEarnings: bookings
      .filter((b) => b.payment?.status === "PAID")
      .reduce((sum, b) => sum + Number(b.payment.amount), 0),
  };
}

export async function listMyBookings(user) {
  if (user.role === "EMPLOYEE") {
    const professional = await professionalRepository.findByUserId(user.id);
    if (!professional) return [];
    const bookings = await bookingRepository.findManyByProfessionalId(professional.id);
    return bookings.map((b) => toSummaryShape(b, "EMPLOYEE"));
  }

  const bookings = await bookingRepository.findManyByUserId(user.id);
  return bookings.map((b) => toSummaryShape(b, "USER"));
}

export async function getBookingById(user, id) {
  const booking = await bookingRepository.findById(id);
  if (!booking) throw new NotFoundError("Booking not found");
  const { isProfessional } = assertParticipant(booking, user);
  return toSummaryShape(booking, isProfessional ? "EMPLOYEE" : "USER");
}

const ALLOWED_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function updateBookingStatus(user, id, status) {
  const booking = await bookingRepository.findById(id);
  if (!booking) throw new NotFoundError("Booking not found");
  const { isOwner, isProfessional } = assertParticipant(booking, user);

  if (status === "CANCELLED") {
    if (!isOwner && !isProfessional && user.role !== "ADMIN") throw new ForbiddenError();
  } else if (!isProfessional && user.role !== "ADMIN") {
    throw new ForbiddenError("Only the assigned professional can update this status");
  }

  if (!ALLOWED_TRANSITIONS[booking.status].includes(status)) {
    throw new ValidationError(`Cannot move booking from ${booking.status} to ${status}`);
  }

  const updated = await bookingRepository.updateStatus(id, status);
  return toSummaryShape(updated, isProfessional ? "EMPLOYEE" : "USER");
}
