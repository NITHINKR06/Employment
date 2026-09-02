import { notFound } from "next/navigation";
import { serverApiFetch, ApiNotFoundError } from "@/lib/serverApiClient";
import BookingWizard from "./BookingWizard";

export async function generateStaticParams() {
  try {
    const body = await serverApiFetch("/professionals");
    return body.data.professionals.map((p) => ({ id: p.id }));
  } catch {
    return [];
  }
}

export default async function BookPage({ params }) {
  const { id } = await params;

  let worker;
  try {
    const body = await serverApiFetch(`/professionals/${id}`);
    worker = body.data.professional;
  } catch (error) {
    if (error instanceof ApiNotFoundError) notFound();
    throw error;
  }

  return <BookingWizard worker={worker} />;
}
