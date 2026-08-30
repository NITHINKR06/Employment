import { getMyProfessional } from "@/server/services/professional.service";
import { requireRole } from "@/server/auth/requireAuth";
import { ok, withErrorHandling } from "@/server/utils/apiResponse";

export const GET = withErrorHandling(async () => {
  const user = await requireRole("EMPLOYEE", "ADMIN");
  const professional = await getMyProfessional(user);
  return ok({ professional });
});
