import { notFound } from "next/navigation";
import { professionals } from "@/data/professionals";
import BookingWizard from "@/components/Booking/BookingWizard";

export function generateStaticParams() {
  return professionals.map((professional) => ({ id: professional.id }));
}

export default function BookServicePage({ params }) {
  const worker = professionals.find((professional) => professional.id === params.id);
  if (!worker) notFound();

  return <BookingWizard worker={worker} />;
}
