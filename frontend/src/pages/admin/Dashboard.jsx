import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend
} from "recharts";
import {
  Users, Film, MessageCircle, BarChart3, BellRing, Trash2, Star, ShieldCheck
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/analytics"),
        ]);
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<Users className="h-6 w-6 text-blue-400" />} title="Total Users" value={stats?.total_users || 0} color="blue" />
          <StatCard icon={<Film className="h-6 w-6 text-purple-400" />} title="Total Movies" value={stats?.total_movies || 0} color="purple" />
          <StatCard icon={<MessageCircle className="h-6 w-6 text-green-400" />} title="Total Chats" value={stats?.total_messages || 0} color="green" />
          <StatCard icon={<Star className="h-6 w-6 text-amber-400" />} title="Total Reviews" value={stats?.total_reviews || 0} color="amber" />
        </div>

        {/* Analytics Charts */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Reviews by Genre */}
            <div className="bg-zinc-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">Reviews by Genre</h2>
              {analytics.reviews_by_genre.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.reviews_by_genre} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="genre" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", color: "#fff", borderRadius: 8 }} />
                    <Bar dataKey="reviews" fill="#e50914" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-10">No review data yet.</p>
              )}
            </div>

            {/* Signups Over Time */}
            <div className="bg-zinc-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">User Signups (8 Weeks)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analytics.signups_by_week} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="week" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", color: "#fff", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="signups" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminCard to="/admin/users" label="Manage Users" desc="View, promote, and delete user accounts." icon={<Trash2 className="h-6 w-6 text-amber-400" />} color="amber" />
          <AdminCard to="/admin/movies" label="Manage Movies" desc="Add new movies or remove existing ones." icon={<Film className="h-6 w-6 text-purple-400" />} color="purple" />
          <AdminCard to="/admin/reviews" label="Moderate Reviews" desc="Read and delete abusive or spam reviews." icon={<Star className="h-6 w-6 text-green-400" />} color="green" />
          <AdminCard to="/admin/notifications" label="Broadcast" desc="Send system alerts to users or blast all." icon={<BellRing className="h-6 w-6 text-primary" />} color="red" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  const colors = {
    blue: "bg-blue-500/10", purple: "bg-purple-500/10",
    green: "bg-green-500/10", amber: "bg-amber-500/10",
  };
  return (
    <div className="bg-zinc-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4">
      <div className={`h-14 w-14 rounded-full ${colors[color] || "bg-zinc-800"} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function AdminCard({ to, label, desc, icon, color }) {
  const borderColors = {
    amber: "hover:border-amber-500/50", purple: "hover:border-purple-500/50",
    green: "hover:border-green-500/50", red: "hover:border-primary/50",
  };
  const textColors = {
    amber: "group-hover:text-amber-400", purple: "group-hover:text-purple-400",
    green: "group-hover:text-green-400", red: "group-hover:text-primary",
  };
  return (
    <Link to={to} className={`group block bg-zinc-900 border border-gray-800 rounded-xl p-6 ${borderColors[color]} transition duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-lg font-bold text-white ${textColors[color]} transition`}>{label}</h2>
        {icon}
      </div>
      <p className="text-gray-500 text-sm">{desc}</p>
    </Link>
  );
}
