import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  Users,
  Film,
  MessageCircle,
  BarChart3,
  BellRing,
  Trash2,
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-secondary pb-20">
      <Navbar />
      <div className="pt-24 mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
          <BarChart3 className="h-8 w-8 text-amber-400" />
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<Users className="h-6 w-6 text-blue-400" />}
            title="Total Users"
            value={stats?.total_users || 0}
          />
          <StatCard
            icon={<Film className="h-6 w-6 text-purple-400" />}
            title="Total Movies"
            value={stats?.total_movies || 0}
          />
          <StatCard
            icon={<MessageCircle className="h-6 w-6 text-green-400" />}
            title="Total Chats"
            value={stats?.total_messages || 0}
          />
          <StatCard
            icon={<BarChart3 className="h-6 w-6 text-amber-400" />}
            title="Total Reviews"
            value={stats?.total_reviews || 0}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Action Cards */}
          <Link
            to="/admin/users"
            className="group block bg-zinc-900 border border-gray-800 rounded-xl p-8 hover:border-amber-500/50 transition duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white group-hover:text-amber-400 transition">
                Manage Users
              </h2>
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-amber-400" />
              </div>
            </div>
            <p className="text-gray-400">
              View the master list of all registered accounts. Suspend or delete
              abusive users and wipe their data.
            </p>
          </Link>

          <Link
            to="/admin/notifications"
            className="group block bg-zinc-900 border border-gray-800 rounded-xl p-8 hover:border-primary/50 transition duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white group-hover:text-primary transition">
                Broadcast Notifications
              </h2>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BellRing className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-gray-400">
              Send custom system alerts or announcements to specific users or
              blast them to the entire platform globally.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-zinc-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4">
      <div className="h-14 w-14 rounded-full bg-zinc-800 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}
