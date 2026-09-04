import RequireAuth from "@/components/Auth/RequireAuth";

export default function BookLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
