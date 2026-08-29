import { Geist, Libre_Caslon_Text } from "next/font/google";
import "./globals.css";
import ClientCookiesBanner from "./ClientCookiesBanner";
import { SITE_NAME } from "@/lib/constants";

const geist = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-geist",
});

const libreCaslonText = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-libre-caslon-text",
});

export const metadata = {
  title: SITE_NAME,
  description: "There's someone nearby who can get it done.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${libreCaslonText.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        {children}
        <ClientCookiesBanner />
      </body>
    </html>
  );
}
