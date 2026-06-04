import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, Star, Eye, TrendingUp } from "lucide-react";
import { api } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/ui/LoadingSpinner";

function LeaderboardCard({ rank, user, stat, statLabel, icon: Icon }) {
  const medalColors = ["text-amber-400", "text-gray-400", "text-orange-600"];
  const bgColors = [
    "bg-gradient-to-r from-amber-500/20 to-amber-600/20",
    "bg-gradient-to-r from-gray-400/20 to-gray-500/20",
    "bg-gradient-to-r from-orange-500/20 to-orange-600/20",
  ];

  return (
    <div
      className={`rounded-lg p-4 border ${
        rank <= 3
          ? `${bgColors[rank - 1]} border-white/20`
          : "bg-zinc-900 border-white/10"
      } hover:bg-white/5 transition`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="flex-shrink-0 w-12 text-center">
          {rank <= 3 ? (
            <Trophy className={`h-8 w-8 mx-auto ${medalColors[rank - 1]}`} />
          ) : (
            <span className="text-2xl font-bold text-gray-600">#{rank}</span>
          )}
        </div>

        {/* User */}
        <Link
          to={`/user/${user.id}`}
          className="flex items-center gap-3 flex-grow min-w-0"
        >
          <div className="h-12 w-12 rounded-full bg-zinc-700 flex items-center justify-center text-lg font-bold overflow-hidden flex-shrink-0">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.username}
                className="h-full w-full object-cover"
              />
            ) : (
              user.username[0].toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white truncate hover:text-primary transition">
              {user.username}
            </p>
            <p className="text-sm text-gray-400">{statLabel}</p>
          </div>
        </Link>

        {/* Stat */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Icon className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold text-white">{stat}</span>
        </div>
      </div>
    </div>
  );
}

export default function Leaderboards() {
  const [topReviewers, setTopReviewers] = useState([]);
  const [mostActive, setMostActive] = useState([]);
  const [highestRated, setHighestRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reviewers");

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const [reviewers, active, rated] = await Promise.all([
          api.get("/leaderboards/top-reviewers"),
          api.get("/leaderboards/most-active"),
          api.get("/leaderboards/highest-rated-reviewers"),
        ]);
        setTopReviewers(reviewers.data);
        setMostActive(active.data);
        setHighestRated(rated.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboards();
  }, []);

  const tabs = [
    { id: "reviewers", label: "Top Reviewers", icon: Star, data: topReviewers },
    { id: "active", label: "Most Active", icon: Eye, data: mostActive },
    { id: "rated", label: "Highest Rated", icon: TrendingUp, data: highestRated },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Leaderboards
          </h1>
          <p className="text-gray-400">See who's leading the MovieMate community</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-zinc-900 text-gray-400 hover:bg-zinc-800"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        {loading ? (
          <LoadingSpinner />
        ) : currentTab.data.length > 0 ? (
          <div className="space-y-3">
            {currentTab.data.map((item, idx) => (
              <LeaderboardCard
                key={item.user.id}
                rank={idx + 1}
                user={item.user}
                stat={
                  activeTab === "reviewers"
                    ? item.review_count
                    : activeTab === "active"
                    ? item.watch_count
                    : item.avg_rating
                }
                statLabel={
                  activeTab === "reviewers"
                    ? `${item.review_count} reviews`
                    : activeTab === "active"
                    ? `${item.watch_count} movies watched`
                    : `${item.avg_rating} avg rating`
                }
                icon={currentTab.icon}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No data available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
