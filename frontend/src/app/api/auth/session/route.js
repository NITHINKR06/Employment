import { z } from "zod";
import { getAdminAuth } from "@/server/auth/firebaseAdmin";
import { setSessionCookie, SESSION_EXPIRES_IN } from "@/server/auth/session";
import { prisma } from "@/server/db/client";
import { ok, withErrorHandling } from "@/server/utils/apiResponse";
import { ValidationError, UnauthorizedError } from "@/server/utils/errors";

const bodySchema = z.object({
  idToken: z.string().min(1),
  role: z.enum(["USER", "EMPLOYEE"]).optional(),
});

export const POST = withErrorHandling(async (request) => {
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    throw new ValidationError("idToken is required", parsed.error.flatten());
  }
  const { idToken, role } = parsed.data;

  const adminAuth = getAdminAuth();

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch {
    throw new UnauthorizedError("Invalid or expired ID token");
  }

  const sessionCookieValue = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN,
  });
  await setSessionCookie(sessionCookieValue);

  const user = await prisma.user.upsert({
    where: { firebaseUid: decodedToken.uid },
    update: {},
    create: {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name ?? decodedToken.email.split("@")[0],
      role: role ?? "USER",
    },
  });

  return ok({ user });
});
