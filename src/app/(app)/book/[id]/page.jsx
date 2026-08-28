import { notFound } from "next/navigation";
import { getProfessionalById, professionals } from "@/data/professionals";
import BookingWizard from "./BookingWizard";

export function generateStaticParams() {
  return professionals.map((p) => ({ id: p.id }));
}

export default async function BookPage({ params }) {
  const { id } = await params;
  const worker = getProfessionalById(id);

  if (!worker) notFound();

  return <BookingWizard worker={worker} />;
}
