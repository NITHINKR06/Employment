import TopNavBar from "@/components/Navbar/TopNavBar";
import BottomNavBar from "@/components/Navbar/BottomNavBar";
import Footer from "@/components/Footer/Footer";
import Notify from "@/components/Notification/Notify";

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNavBar variant="dashboard" />
      <main className="flex-1 pt-32 pb-24 md:pb-0">{children}</main>
      <BottomNavBar />
      <Footer variant="full" />
      <Notify />
    </div>
  );
}
