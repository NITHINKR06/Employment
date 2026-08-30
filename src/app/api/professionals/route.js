import {
  listProfessionals,
  createProfessional,
} from "@/server/services/professional.service";
import { requireRole } from "@/server/auth/requireAuth";
import { ok, withErrorHandling } from "@/server/utils/apiResponse";
import { ValidationError } from "@/server/utils/errors";
import {
  listProfessionalsQuerySchema,
  createProfessionalSchema,
} from "@/server/validators/professional.schema";

export const GET = withErrorHandling(async (request) => {
  const { searchParams } = new URL(request.url);
  const parsed = listProfessionalsQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    throw new ValidationError("Invalid query parameters", parsed.error.flatten());
  }

  const professionals = await listProfessionals(parsed.data);
  return ok({ professionals });
});

export const POST = withErrorHandling(async (request) => {
  const user = await requireRole("EMPLOYEE", "ADMIN");

  const parsed = createProfessionalSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    throw new ValidationError("Invalid professional data", parsed.error.flatten());
  }

  const professional = await createProfessional(user, parsed.data);
  return ok({ professional }, 201);
});
