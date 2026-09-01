import { clearSessionCookie } from "@/server/auth/session";
import { ok, withErrorHandling } from "@/server/utils/apiResponse";

export const POST = withErrorHandling(async () => {
  await clearSessionCookie();
  return ok({ loggedOut: true });
});
