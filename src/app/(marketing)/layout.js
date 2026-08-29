import TopNavBar from "@/components/Navbar/TopNavBar";
import Footer from "@/components/Footer/Footer";
import Notify from "@/components/Notification/Notify";

export default function MarketingLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNavBar variant="marketing" />
      <main className="flex-1 pt-32">{children}</main>
      <Footer variant="full" />
      <Notify />
    </div>
  );
}
