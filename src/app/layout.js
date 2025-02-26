// import type { Metadata } from "next";
import NavUser from "@/components/Navbar/Navbar";
import "./globals.css";
import Footer from "@/components/Footer/Footer";
import Notify from "@/components/Notification/Notify";
import NavbarWrapper from "@/components/Navbar/WrappedNav";

export const metadata = {
  title: "Employement",
  description: "Welcome!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <div className="flex flex-col min-h-screen">

          {/* Fixed Navbar */}
          <header className="top-0 left-0 w-full backdrop-blur-lg">
            <NavbarWrapper />
          </header>

          {/* Main Content */}
          {/* flex-1 flex justify-center items-center pt-[64px] pb-[64px] overflow-y-auto */}
          <main className="flex-1 flex justify-center pt-[40px] items-center overflow-y-auto">
            {children}
          </main>

          <div>
            <Notify/>
          </div>

          {/* Fixed Footer */}
          <footer className=" w-full bottom-0">
            <Footer/>
          </footer>
          
        </div>
      </body>
    </html>
  );
}
