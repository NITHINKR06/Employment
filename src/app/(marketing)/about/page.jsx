import Image from "next/image";
import { IoShieldCheckmarkOutline, IoCheckmarkCircleOutline, IoStorefrontOutline } from "react-icons/io5";
import { SITE_NAME } from "@/lib/constants";

const TRUST_POINTS = [
  { icon: IoShieldCheckmarkOutline, title: "Background-checked pros", description: "Every professional passes an identity and skill verification before joining." },
  { icon: IoCheckmarkCircleOutline, title: "Satisfaction guaranteed", description: "Not happy with the work? We'll make it right or refund the job." },
  { icon: IoStorefrontOutline, title: "Local, always", description: "We only list professionals working in your own community." },
];

const FAQS = [
  { question: "How are professionals vetted?", answer: "Every pro submits ID verification and at least two references before being listed." },
  { question: "What if a job goes wrong?", answer: "Our protection guarantee covers accidental property damage up to $10,000 per booking." },
  { question: "How do I pay?", answer: "Payment is collected securely after you confirm a booking, never before." },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-section-gap pb-section-gap">
      <section className="container grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
        <div className="col-span-1 md:col-span-6 flex flex-col gap-6">
          <h1 className="font-serif text-display-lg-mobile md:text-headline-md text-on-surface">Our Journey</h1>
          <p className="font-sans text-body-lg text-on-surface-variant">
            {SITE_NAME} exists to make hiring a trustworthy professional as simple as it should be —
            built on strict vetting, transparent pricing, and a commitment to the people doing the work.
          </p>
          <ul className="flex flex-col gap-4">
            {TRUST_POINTS.map((point) => (
              <li key={point.title} className="flex items-start gap-4">
                <point.icon className="text-2xl text-primary shrink-0 mt-1" />
                <div>
                  <p className="font-sans font-semibold text-on-surface">{point.title}</p>
                  <p className="font-sans text-[14px] text-on-surface-variant">{point.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-1 md:col-span-6 relative h-80 rounded-xl overflow-hidden border border-on-surface/10 bg-surface-container-high">
          <Image src="/banner.webp" alt="Our team at work" fill className="object-cover" />
        </div>
      </section>

      <section className="w-full bg-surface-container-low py-24 border-y border-on-surface/5">
        <div className="container">
          <h2 className="font-serif text-headline-md text-on-surface mb-12">Our Commitment to Safety</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TRUST_POINTS.map((point) => (
              <div key={point.title} className="bg-surface-container-lowest rounded-xl p-8 border border-on-surface/10">
                <point.icon className="text-3xl text-primary mb-4" />
                <h3 className="font-serif text-headline-sm text-on-surface mb-2">{point.title}</h3>
                <p className="font-sans text-body-md text-on-surface-variant">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div>
          <h2 className="font-serif text-headline-sm text-on-surface mb-6">Frequently Asked</h2>
          <div className="flex flex-col divide-y divide-on-surface/10">
            {FAQS.map((faq) => (
              <details key={faq.question} className="py-4 group">
                <summary className="font-sans font-semibold text-on-surface cursor-pointer list-none flex justify-between">
                  {faq.question}
                  <span className="text-primary group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="font-sans text-body-md text-on-surface-variant mt-2">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-serif text-headline-sm text-on-surface mb-6">Still have a question?</h2>
          <p className="font-sans text-body-md text-on-surface-variant">
            Reach our support team any time at{" "}
            <a href="mailto:hello@localpro.example" className="text-primary hover:underline">
              hello@localpro.example
            </a>
            , or visit our full{" "}
            <a href="/contacts" className="text-primary hover:underline">
              contact page
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
