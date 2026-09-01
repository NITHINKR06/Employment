import { notFound } from "next/navigation";
import { getProfessionalById, listProfessionals } from "@/server/services/professional.service";
import { NotFoundError } from "@/server/utils/errors";
import BookingWizard from "./BookingWizard";

export async function generateStaticParams() {
  const professionals = await listProfessionals();
  return professionals.map((p) => ({ id: p.id }));
}

export default async function BookPage({ params }) {
  const { id } = await params;

  let worker;
  try {
    worker = await getProfessionalById(id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  return <BookingWizard worker={worker} />;
}
