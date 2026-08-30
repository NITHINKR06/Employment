import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ClientCookiesBanner from "./ClientCookiesBanner";
import { SITE_NAME } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata = {
  title: SITE_NAME,
  description: "Get the job done. By someone you can trust.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="min-h-screen bg-background font-sans text-on-background antialiased">
        {children}
        <ClientCookiesBanner />
      </body>
    </html>
  );
}
