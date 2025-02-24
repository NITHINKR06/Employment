'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaFacebookF, FaInstagram, FaTwitter, FaGithub, FaDribbble } from "react-icons/fa";

export default function Footer() {
  const socialLinks = [
    { name: "Facebook", link: "#", icon: <FaFacebookF className="h-6 w-6" /> },
    { name: "Instagram", link: "#", icon: <FaInstagram className="h-6 w-6" /> },
    { name: "Twitter", link: "#", icon: <FaTwitter className="h-6 w-6" /> },
    { name: "GitHub", link: "#", icon: <FaGithub className="h-6 w-6" /> },
    { name: "Dribbble", link: "#", icon: <FaDribbble className="h-6 w-6" /> },
  ];

  const pathname = usePathname();
  const authPages = ["/auth/login.html", "/auth/signup", "/auth/register"];

  if (authPages.includes(pathname)) {
    return null; // Hide footer on auth pages
  }

  return (
    <footer className="bg-gray-50 shadow-md w-full">
      <div className="shadow-md w-full">
        <div className="mx-auto max-w-screen-xl space-y-8 px-4 py-16 sm:px-6 lg:space-y-16 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Section */}
            <div>
              <h1 className="text-lg font-semibold">Emp</h1>
              <p className="mt-4 max-w-xs text-gray-500">
                Join us to unlock your potential with a wide variety of courses designed just for you.
              </p>
              <ul className="mt-8 flex flex-wrap gap-6">
                {socialLinks.map((social, index) => (
                  <li key={index}>
                    <Link
                      href={social.link}
                      rel="noreferrer"
                      target="_blank"
                      className="text-gray-700 transition hover:opacity-75 flex items-center gap-2"
                    >
                      {social.icon}
                      <span className="sr-only">{social.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Section */}
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-3 items-end">
              {[
                {
                  title: "Company",
                  links: ["About", "Meet the Team", "Accounts Review"],
                },
                {
                  title: "Helpful Links",
                  links: ["Contact-us", "About-us", "FAQs", "Live Chat"],
                },
                {
                  title: "Legal",
                  links: ["Accessibility", "Refund Policy", "Privacy Policy"],
                },
              ].map((section, index) => (
                <div key={index} className="w-auto h-40">
                  <p className="font-medium text-gray-900">{section.title}</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {section.links.map((link, i) => (
                      <li key={i}>
                        <Link href="#" className="text-gray-700 transition hover:opacity-75">
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">&copy; 2025. MentorConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
