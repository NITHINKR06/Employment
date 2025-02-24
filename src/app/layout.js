// import type { Metadata } from "next";
import localFont from "next/font/local";
import NavUser from "@/components/Navbar/NavUser";
import "./globals.css";
import Footer from "@/components/Footer/Footer";

export const metadata = {
  title: "Employement",
  description: "Welcome!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
       <body
        className={`antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          {/* Fixed Navbar */}
          <header className="fixed top-0 left-0 w-full z-50">
            <NavUser />
          </header>

          {/* Main Content */}
          <main className="flex-1 flex justify-center items-center pt-[64px] pb-[64px] overflow-y-auto">
            {children}
          </main>

          {/* Fixed Footer */}
          <footer className="bottom-0 ">
            <Footer/>
          </footer>
          
        </div>
      </body>
    </html>
  );
}
