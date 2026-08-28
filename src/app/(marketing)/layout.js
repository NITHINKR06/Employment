import TopNavBar from "@/components/Navbar/TopNavBar";
import Footer from "@/components/Footer/Footer";
import Notify from "@/components/Notification/Notify";

export default function MarketingLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNavBar variant="marketing" />
      <main className="flex-1">{children}</main>
      <Footer variant="full" />
      <Notify />
    </div>
  );
}
