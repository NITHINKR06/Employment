import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaGithub,
  FaDribbble,
} from "react-icons/fa";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const socialLinks = [
  { name: "Facebook", link: "#", icon: <FaFacebookF /> },
  { name: "Instagram", link: "#", icon: <FaInstagram /> },
  { name: "Twitter", link: "#", icon: <FaTwitter /> },
  { name: "GitHub", link: "#", icon: <FaGithub /> },
  { name: "Dribbble", link: "#", icon: <FaDribbble /> },
];

const footerSections = [
  {
    title: "Company",
    links: [
      { name: "About", route: "/about" },
      { name: "Browse Professionals", route: "/search" },
      { name: "Success Stories", route: "/about" },
    ],
  },
  {
    title: "Helpful Links",
    links: [
      { name: "Contact Us", route: "/contacts" },
      { name: "Become a Pro", route: "/auth/signup" },
      { name: "How it Works", route: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", route: "/about" },
      { name: "Terms of Service", route: "/about" },
    ],
  },
];

export default function Footer({ variant = "full" }) {
  if (variant === "compact") {
    return (
      <footer className="w-full border-t border-on-surface/10 py-8 px-margin-mobile md:px-margin-desktop text-center">
        <span className="font-serif text-headline-sm text-primary">{SITE_NAME}</span>
        <p className="font-sans text-body-md text-secondary mt-2">
          © 2026 {SITE_NAME}. {SITE_TAGLINE}
        </p>
      </footer>
    );
  }

  return (
    <footer className="w-full border-t border-on-surface/10 bg-surface-container-lowest">
      <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-16 grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="col-span-1 md:col-span-4 flex flex-col gap-4">
          <span className="font-serif text-headline-md text-primary">{SITE_NAME}</span>
          <p className="font-sans text-body-md text-secondary max-w-xs">
            © 2026 {SITE_NAME}. {SITE_TAGLINE}
          </p>
          <ul className="flex flex-wrap gap-6 mt-2">
            {socialLinks.map((social) => (
              <li key={social.name}>
                <Link
                  href={social.link}
                  className="text-on-surface hover:text-primary transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-1 md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-4">
              <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface">
                {section.title}
              </p>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.route}
                      className="font-sans text-body-md text-secondary hover:text-primary hover:underline underline-offset-4 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
