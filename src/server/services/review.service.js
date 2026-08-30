import * as reviewRepository from "../repositories/review.repository";
import * as bookingRepository from "../repositories/booking.repository";
import * as professionalRepository from "../repositories/professional.repository";
import { NotFoundError, ForbiddenError, ValidationError } from "../utils/errors";

function toPublicShape(review) {
  return {
    id: review.id,
    author: review.booking.user.name,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  };
}

export async function createReview(user, bookingId, { rating, comment }) {
  const booking = await bookingRepository.findById(bookingId);
  if (!booking) throw new NotFoundError("Booking not found");
  if (booking.userId !== user.id) throw new ForbiddenError("This booking does not belong to you");
  if (booking.status !== "COMPLETED") {
    throw new ValidationError("You can only review a completed booking");
  }

  const existing = await reviewRepository.findByBookingId(bookingId);
  if (existing) throw new ValidationError("This booking has already been reviewed");

  await reviewRepository.create({ bookingId, rating, comment });

  const { avg, count } = await reviewRepository.aggregateForProfessional(booking.professionalId);
  await professionalRepository.update(booking.professionalId, {
    ratingAvg: Math.round(avg * 100) / 100,
    reviewCount: count,
  });

  const [review] = await reviewRepository.findManyByProfessionalId(booking.professionalId);
  return toPublicShape(review);
}

export async function listProfessionalReviews(professionalId) {
  const reviews = await reviewRepository.findManyByProfessionalId(professionalId);
  return reviews.map(toPublicShape);
}
