import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Heart, Play, MessageSquare, Clock } from "lucide-react";
import { api } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../context/ToastContext";

function ActivityCard({ activity }) {
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  const iconMap = {
    review: <MessageSquare className="h-5 w-5 text-blue-500" />,
    wishlist: <Heart className="h-5 w-5 text-pink-500" />,
    watch: <Play className="h-5 w-5 text-green-500" />,
  };

  const textMap = {
    review: "reviewed",
    wishlist: "added to wishlist",
    watch: "watched",
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg p-4 hover:bg-zinc-800 transition">
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <Link to={`/user/${activity.user.id}`} className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-zinc-700 flex items-center justify-center text-lg font-bold overflow-hidden">
            {activity.user.profile_picture ? (
              <img
                src={activity.user.profile_picture}
                alt={activity.user.username}
                className="h-full w-full object-cover"
              />
            ) : (
              activity.user.username[0].toUpperCase()
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {iconMap[activity.type]}
            <Link
              to={`/user/${activity.user.id}`}
              className="font-bold text-white hover:text-primary transition"
            >
              {activity.user.username}
            </Link>
            <span className="text-gray-400 text-sm">{textMap[activity.type]}</span>
            <Link
              to={`/movie/${activity.movie.id}`}
              className="text-primary hover:underline font-semibold truncate"
            >
              {activity.movie.title}
            </Link>
          </div>

          {activity.type === "review" && activity.content && (
            <div className="mb-2">
              {activity.rating && (
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">
                    {activity.rating}/10
                  </span>
                </div>
              )}
              <p className="text-sm text-gray-300 line-clamp-2">{activity.content}</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {getTimeAgo(activity.timestamp)}
          </div>
        </div>

        {/* Movie Poster */}
        <Link to={`/movie/${activity.movie.id}`} className="flex-shrink-0">
          <img
            src={
              activity.movie.poster_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                activity.movie.title
              )}&background=27272a&color=fff`
            }
            alt={activity.movie.title}
            className="h-20 w-14 object-cover rounded shadow"
          />
        </Link>
      </div>
    </div>
  );
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const toast = useToast();

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await api.get("/feed/");
        setActivities(res.data.activities);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load activity feed");
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [toast]);

  const filteredActivities =
    filterType === "all"
      ? activities
      : activities.filter((a) => a.type === filterType);

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-2">Activity Feed</h1>
        <p className="text-gray-400 mb-6">See what your friends are watching and reviewing</p>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["all", "review", "wishlist", "watch"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${
                filterType === type
                  ? "bg-primary text-white"
                  : "bg-zinc-900 text-gray-400 hover:bg-zinc-800"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Activities */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredActivities.length > 0 ? (
          <div className="space-y-4">
            {filteredActivities.map((activity, idx) => (
              <ActivityCard key={idx} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No activities yet</p>
            <p className="text-gray-600 text-sm mt-2">
              Add some friends to see their activities!
            </p>
            <Link
              to="/friends"
              className="inline-block mt-4 bg-primary hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition"
            >
              Find Friends
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
