import { z } from "zod";

export const createBookingSchema = z.object({
  professionalId: z.string().min(1),
  serviceId: z.string().min(1).optional(),
  scheduledAt: z.string().datetime().optional(),
  address: z.string().min(1),
  notes: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});
