"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyUserId, setBusyUserId] = useState(null);

  const load = (searchTerm) => {
    setIsLoading(true);
    const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
    return apiFetch(`/admin/users${query}`)
      .then((body) => {
        if (body.success && body.data?.users) setUsers(body.data.users);
      })
      .catch((err) => setError(err.message || "Could not load users"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load("");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  const toggleSuspend = async (user) => {
    setBusyUserId(user.id);
    try {
      await apiFetch(`/admin/users/${user.id}/${user.isActive ? "suspend" : "unsuspend"}`, {
        method: "POST",
      });
      await load(search);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="h-10 flex-1 rounded border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary"
        >
          Search
        </button>
      </form>

      {error && <p className="mt-3 text-label-sm font-semibold text-error">{error}</p>}

      <div className="mt-4 overflow-x-auto rounded-lg border border-outline-variant/60">
        <table className="w-full text-left text-body-md">
          <thead className="bg-surface-container-lowest text-label-sm text-on-surface-variant">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-on-surface-variant">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-on-surface-variant">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-outline-variant/40">
                  <td className="p-3 text-on-surface">{user.name}</td>
                  <td className="p-3 text-on-surface-variant">{user.email}</td>
                  <td className="p-3 text-on-surface-variant">{user.role}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-label-sm font-semibold ${
                        user.isActive
                          ? "bg-primary-container/20 text-primary"
                          : "bg-error-container/20 text-error"
                      }`}
                    >
                      {user.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      disabled={busyUserId === user.id}
                      onClick={() => toggleSuspend(user)}
                      className="rounded-lg border border-outline-variant px-3 py-1.5 text-label-sm font-semibold text-on-surface hover:bg-surface-container-low disabled:opacity-60"
                    >
                      {busyUserId === user.id ? "..." : user.isActive ? "Suspend" : "Unsuspend"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
