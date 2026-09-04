import RequireAuth from "@/components/Auth/RequireAuth";

export default function PaymentLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
