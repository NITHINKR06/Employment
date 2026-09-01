import { createReview } from "@/server/services/review.service";
import { requireAuth } from "@/server/auth/requireAuth";
import { ok, withErrorHandling } from "@/server/utils/apiResponse";
import { ValidationError } from "@/server/utils/errors";
import { createReviewSchema } from "@/server/validators/review.schema";

export const POST = withErrorHandling(async (request, { params }) => {
  const { id } = await params;
  const user = await requireAuth();

  const parsed = createReviewSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    throw new ValidationError("Invalid review data", parsed.error.flatten());
  }

  const review = await createReview(user, id, parsed.data);
  return ok({ review }, 201);
});
