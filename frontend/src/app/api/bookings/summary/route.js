import { getEmployeeSummary } from "@/server/services/booking.service";
import { requireRole } from "@/server/auth/requireAuth";
import { ok, withErrorHandling } from "@/server/utils/apiResponse";

export const GET = withErrorHandling(async () => {
  const user = await requireRole("EMPLOYEE", "ADMIN");
  const summary = await getEmployeeSummary(user);
  return ok({ summary });
});
