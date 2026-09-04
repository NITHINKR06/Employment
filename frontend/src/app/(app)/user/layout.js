import RequireAuth from "@/components/Auth/RequireAuth";

export default function UserLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
