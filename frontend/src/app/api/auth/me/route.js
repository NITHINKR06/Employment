import { getCurrentUser } from "@/server/auth/requireAuth";
import { ok, withErrorHandling } from "@/server/utils/apiResponse";

export const GET = withErrorHandling(async () => {
  const user = await getCurrentUser();
  return ok({ user });
});
