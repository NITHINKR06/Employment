import { z } from "zod";

export const listProfessionalsQuerySchema = z.object({
  trade: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").map((t) => t.trim()).filter(Boolean) : undefined)),
  search: z.string().trim().optional(),
  minRate: z.coerce.number().nonnegative().optional(),
  maxRate: z.coerce.number().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
});

export const createProfessionalSchema = z.object({
  title: z.string().min(1),
  trade: z.string().min(1),
  yearsExperience: z.coerce.number().int().nonnegative().default(0),
  hourlyRate: z.coerce.number().positive(),
  bio: z.string().optional(),
  location: z.string().optional(),
  avatar: z.string().url().optional(),
  availability: z.string().optional(),
  skills: z.array(z.string().min(1)).default([]),
  trustBadges: z.array(z.string().min(1)).default([]),
  servicesOffered: z
    .array(z.object({ title: z.string().min(1), subtext: z.string().optional() }))
    .default([]),
});

export const updateProfessionalSchema = createProfessionalSchema.partial();
