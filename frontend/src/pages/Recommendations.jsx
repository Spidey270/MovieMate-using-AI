import { useState, useEffect, useCallback, useRef } from "react";
import { api, useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Sparkles, RefreshCw, Brain, Users, Star, Heart, Clock } from "lucide-react";

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function Recommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const intervalRef = useRef(null);

  const fetchRecs = useCallback(async () => {
    try {
      const res = await api.get("/recommendations");
      setRecommendations(res.data || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post("/recommendations/generate");
      // Poll for completion — Gemini usually takes 3-8s
      setTimeout(async () => {
        await fetchRecs();
        setRefreshing(false);
      }, 6000);
    } catch (err) {
      console.error(err);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) fetchRecs();
    else setLoading(false);
  }, [user, fetchRecs]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (user && recommendations.length > 0) {
      intervalRef.current = setInterval(() => {
        handleRefresh();
      }, AUTO_REFRESH_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, recommendations.length]);

  const formatLastRefreshed = () => {
    if (!lastRefreshed) return "Never";
    const diff = Math.floor((new Date() - lastRefreshed) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return (
      <div className="min-h-screen bg-secondary text-white">
        <Navbar />
        <div className="pt-24 max-w-lg mx-auto text-center px-4">
          <Sparkles className="h-14 w-14 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-3">AI Recommendations</h1>
          <p className="text-gray-400">Please log in to get personalized AI-powered movie picks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary text-white pb-20">
      <Navbar />
      <div className="pt-24 mx-auto max-w-7xl px-4">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Your AI Picks
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Gemini analyses your taste, reviews, wishlist &amp; friends to pick these for you.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-zinc-800 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              Updated {formatLastRefreshed()}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary px-5 py-2.5 rounded-full text-sm font-semibold transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "AI is thinking…" : "Refresh Picks"}
            </button>
          </div>
        </div>

        {/* Signals legend */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { icon: <Heart className="h-3.5 w-3.5" />, label: "Your preferences", color: "text-red-400 bg-red-400/10 border-red-400/20" },
            { icon: <Star className="h-3.5 w-3.5" />, label: "Your reviews", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
            { icon: <Users className="h-3.5 w-3.5" />, label: "Friends' taste", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
            { icon: <Brain className="h-3.5 w-3.5" />, label: "Gemini AI", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
          ].map(({ icon, label, color }) => (
            <span key={label} className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${color}`}>
              {icon} {label}
            </span>
          ))}
        </div>

        {refreshing && (
          <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-xl px-5 py-4 mb-8 text-purple-300 text-sm">
            <Brain className="h-5 w-5 animate-pulse" />
            Gemini is analysing your profile and finding perfect picks… This takes about 6 seconds.
          </div>
        )}

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {recommendations.map((movie) => (
              <div key={movie.id} className="flex flex-col gap-2">
                <div className="flex-shrink-0">
                  <MovieCard movie={movie} />
                </div>
                {movie.ai_reason && (
                  <div className="flex items-start gap-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg px-2.5 py-1.5">
                    <Sparkles className="h-3 w-3 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-purple-300 leading-relaxed">{movie.ai_reason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-dashed border-gray-800 rounded-xl bg-zinc-900/30">
            <Brain className="h-14 w-14 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-medium mb-1">No recommendations yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Add movies to your wishlist, leave reviews, or follow friends to help the AI understand your taste.
            </p>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-primary hover:bg-red-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition disabled:opacity-50"
            >
              {refreshing ? "Generating…" : "Generate My First Picks"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
