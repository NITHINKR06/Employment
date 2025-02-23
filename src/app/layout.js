// import { Geist, Geist_Mono } from "next/font/google";
import NavUser from "@/components/Navbar/NavUser";
import "./globals.css";

export const metadata = {
  title: "Employement",
  description: "Welcome!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="fixed top-0 left-0 w-full z-50">
          <NavUser />
        </header>
        {children}
      </body>
    </html>
  );
}
