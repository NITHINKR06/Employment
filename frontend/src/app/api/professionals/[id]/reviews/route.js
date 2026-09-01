import { listProfessionalReviews } from "@/server/services/review.service";
import { ok, withErrorHandling } from "@/server/utils/apiResponse";

export const GET = withErrorHandling(async (_request, { params }) => {
  const { id } = await params;
  const reviews = await listProfessionalReviews(id);
  return ok({ reviews });
});
