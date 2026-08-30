import { getAdminAuth } from "./firebaseAdmin";
import { getSessionCookie } from "./session";
import { prisma } from "../db/client";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";

export async function getCurrentUser() {
  const sessionCookieValue = await getSessionCookie();
  if (!sessionCookieValue) return null;

  let decodedClaims;
  try {
    decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookieValue, true);
  } catch {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { firebaseUid: decodedClaims.uid },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

export async function requireRole(...roles) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new ForbiddenError();
  }
  return user;
}
