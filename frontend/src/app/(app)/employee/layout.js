import RequireAuth from "@/components/Auth/RequireAuth";

export default function EmployeeLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
