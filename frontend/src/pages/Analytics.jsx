import { useEffect, useState } from "react";
import { api } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Trophy, Clock, Star, Film, Flame, Heart, Users } from "lucide-react";

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/analytics/personal");
      setStats(response.data);
    } catch (error) {
      addToast("Failed to load stats", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!stats) return null;

  const COLORS = ["#e50914", "#b20710", "#831010", "#ff1a1a", "#ff4d4d"];

  const ratingData = [
    { name: "1 Star", value: stats.rating_distribution["1_star"] },
    { name: "2 Stars", value: stats.rating_distribution["2_star"] },
    { name: "3 Stars", value: stats.rating_distribution["3_star"] },
    { name: "4 Stars", value: stats.rating_distribution["4_star"] },
    { name: "5 Stars", value: stats.rating_distribution["5_star"] },
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-secondary text-white pb-20">
      <Navbar />

      <div className="pt-24 mx-auto max-w-7xl px-4">
        <h1 className="text-4xl font-bold mb-8">Your Analytics</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Film className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Movies Watched</p>
                <p className="text-3xl font-bold">{stats.total_watched}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Hours Watched</p>
                <p className="text-3xl font-bold">{stats.total_watch_time_hours}h</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Star className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Reviews Written</p>
                <p className="text-3xl font-bold">{stats.total_reviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Flame className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Current Streak</p>
                <p className="text-3xl font-bold">{stats.current_streak} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-5 w-5 text-primary" />
              <p className="text-gray-400 text-sm">Longest Streak</p>
            </div>
            <p className="text-2xl font-bold">{stats.longest_streak} days</p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <p className="text-gray-400 text-sm">Average Rating</p>
            </div>
            <p className="text-2xl font-bold">{stats.average_rating} ★</p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-5 w-5 text-pink-400" />
              <p className="text-gray-400 text-sm">Wishlist Items</p>
            </div>
            <p className="text-2xl font-bold">{stats.wishlist_count}</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Rating Distribution */}
          {ratingData.length > 0 && (
            <div className="bg-zinc-900 rounded-xl p-6 border border-white/5">
              <h2 className="text-xl font-bold mb-4">Rating Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #333" }}
                  />
                  <Bar dataKey="value" fill="#e50914" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Genre Breakdown */}
          {stats.favorite_genres.length > 0 && (
            <div className="bg-zinc-900 rounded-xl p-6 border border-white/5">
              <h2 className="text-xl font-bold mb-4">Top Genres</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.favorite_genres}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {stats.favorite_genres.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid #333" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Watch History Over Time */}
        {stats.monthly_watches.length > 0 && (
          <div className="bg-zinc-900 rounded-xl p-6 border border-white/5 mb-8">
            <h2 className="text-xl font-bold mb-4">Watch History</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthly_watches}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid #333" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#e50914"
                  strokeWidth={2}
                  name="Movies Watched"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
