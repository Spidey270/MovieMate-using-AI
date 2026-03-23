import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { ArrowLeft, Trash2, Users } from "lucide-react";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, username) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete '${username}'? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
      alert("User deleted successfully!");
    } catch (err) {
      alert("Failed to delete user.");
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-secondary pb-20">
      <Navbar />
      <div className="pt-24 mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/dashboard"
              className="text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="h-8 w-8 text-amber-400" />
              Manage Users
            </h1>
          </div>
          <div className="text-sm text-gray-400 bg-zinc-900 px-4 py-2 border border-gray-800 rounded-full">
            Total Records:{" "}
            <span className="text-white font-bold">{users.length}</span>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-zinc-950 text-xs text-gray-400 uppercase tracking-wide border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-800 hover:bg-zinc-800/50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-xs uppercase">
                        {u.username[0]}
                      </div>
                      {u.username}
                    </td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      {u.is_admin ? (
                        <span className="bg-amber-500/20 text-amber-400 py-1 px-3 rounded-full text-xs font-bold border border-amber-500/30">
                          Admin
                        </span>
                      ) : (
                        <span className="bg-blue-500/20 text-blue-400 py-1 px-3 rounded-full text-xs font-bold border border-blue-500/30">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(u.id, u.username)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-full transition"
                        disabled={u.is_admin}
                        title={
                          u.is_admin ? "Cannot delete admins" : "Delete User"
                        }
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                No users found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
