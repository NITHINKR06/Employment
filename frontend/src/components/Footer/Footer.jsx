import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter, FaGithub, FaDribbble } from "react-icons/fa";
import { SITE_NAME } from "@/lib/constants";

const socialLinks = [
  { name: "Facebook", link: "#", icon: <FaFacebookF className="h-5 w-5" /> },
  { name: "Instagram", link: "#", icon: <FaInstagram className="h-5 w-5" /> },
  { name: "Twitter", link: "#", icon: <FaTwitter className="h-5 w-5" /> },
  { name: "GitHub", link: "#", icon: <FaGithub className="h-5 w-5" /> },
  { name: "Dribbble", link: "#", icon: <FaDribbble className="h-5 w-5" /> },
];

const footerSections = [
  {
    title: "Company",
    links: [
      { name: "About Us", route: "/about" },
      { name: "Find Professionals", route: "/search" },
      { name: "Become a Pro", route: "/auth/signup" },
    ],
  },
  {
    title: "Helpful Links",
    links: [
      { name: "Contact Us", route: "/contacts" },
      { name: "FAQs", route: "/about" },
      { name: "User Dashboard", route: "/user/dashboard" },
    ],
  },
  {
    title: "Legal & Safety",
    links: [
      { name: "Trust & Safety", route: "/about" },
      { name: "Terms of Service", route: "/about" },
      { name: "Privacy Policy", route: "/about" },
    ],
  },
];

export default function Footer({ variant = "full" }) {
  if (variant === "compact") {
    return (
      <footer className="w-full border-t border-outline-variant bg-surface-container">
        <div className="container flex flex-col items-center gap-2 py-6 text-center">
          <Link href="/" className="font-display text-headline-sm font-bold text-primary">
            {SITE_NAME}
          </Link>
          <p className="text-label-sm text-on-surface-variant">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full border-t border-outline-variant bg-surface-container">
      <div className="container space-y-12 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-headline-sm font-bold text-primary">{SITE_NAME}</h2>
            <p className="mt-4 max-w-xs text-body-md text-on-surface-variant">
              Connect with highly-rated, verified local professionals for any home project.
            </p>
            <ul className="mt-8 flex flex-wrap gap-6">
              {socialLinks.map((social) => (
                <li key={social.name}>
                  <Link
                    href={social.link}
                    rel="noreferrer"
                    target="_blank"
                    className="flex items-center gap-2 text-on-surface-variant transition hover:text-primary"
                  >
                    {social.icon}
                    <span className="sr-only">{social.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            {footerSections.map((section) => (
              <div key={section.title}>
                <p className="text-label-md font-semibold text-on-surface">{section.title}</p>
                <ul className="mt-4 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.route}
                        className="text-body-md text-on-surface-variant transition hover:text-primary"
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

        <p className="text-center text-label-sm text-on-surface-variant">
          &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
