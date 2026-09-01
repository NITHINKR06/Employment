import {
  getProfessionalById,
  updateProfessional,
  deleteProfessional,
} from "@/server/services/professional.service";
import { requireAuth } from "@/server/auth/requireAuth";
import { ok, withErrorHandling } from "@/server/utils/apiResponse";
import { ValidationError } from "@/server/utils/errors";
import { updateProfessionalSchema } from "@/server/validators/professional.schema";

export const GET = withErrorHandling(async (_request, { params }) => {
  const { id } = await params;
  const professional = await getProfessionalById(id);
  return ok({ professional });
});

export const PATCH = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const user = await requireAuth();

  const parsed = updateProfessionalSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    throw new ValidationError("Invalid professional data", parsed.error.flatten());
  }

  const professional = await updateProfessional(user, id, parsed.data);
  return ok({ professional });
});

export const DELETE = withErrorHandling(async (_request, { params }) => {
  const { id } = await params;
  const user = await requireAuth();
  await deleteProfessional(user, id);
  return ok({ deleted: true });
});
