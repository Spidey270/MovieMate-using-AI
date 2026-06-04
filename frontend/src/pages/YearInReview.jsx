import { useEffect, useState } from "react";
import { api } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import { Trophy, Clock, Film, Heart } from "lucide-react";

export default function YearInReview() {
  const [yearData, setYearData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchYearData();
  }, [selectedYear]);

  const fetchYearData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/analytics/year-in-review/${selectedYear}`);
      setYearData(response.data);
    } catch (error) {
      addToast("Failed to load year in review", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 2020; year--) {
    years.push(year);
  }

  return (
    <div className="min-h-screen bg-secondary text-white">
      <Navbar />

      <div className="pt-24 mx-auto max-w-4xl px-4 pb-20">
        {/* Year Selector */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <h1 className="text-3xl font-bold">Year in Review</h1>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {yearData?.message ? (
          <div className="bg-zinc-900 rounded-xl p-12 text-center border border-white/5">
            <p className="text-xl text-gray-400">{yearData.message}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary via-red-700 to-red-900 rounded-2xl p-12 text-center">
              <h2 className="text-5xl font-bold mb-4">{selectedYear}</h2>
              <p className="text-2xl opacity-90">Your MovieMate Journey</p>
            </div>

            {/* Total Movies */}
            <div className="bg-zinc-900 rounded-xl p-8 border border-white/5 text-center">
              <Film className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-gray-400 mb-2">You watched</p>
              <p className="text-6xl font-bold mb-2">{yearData?.total_movies}</p>
              <p className="text-2xl text-gray-400">movies in {selectedYear}</p>
            </div>

            {/* Total Hours */}
            <div className="bg-zinc-900 rounded-xl p-8 border border-white/5 text-center">
              <Clock className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">That's</p>
              <p className="text-6xl font-bold mb-2">{yearData?.total_hours}</p>
              <p className="text-2xl text-gray-400">hours of entertainment</p>
            </div>

            {/* Top Genre */}
            {yearData?.top_genre && (
              <div className="bg-zinc-900 rounded-xl p-8 border border-white/5 text-center">
                <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Your favorite genre was</p>
                <p className="text-5xl font-bold mb-2">{yearData.top_genre}</p>
              </div>
            )}

            {/* Most Watched Month */}
            {yearData?.most_watched_month && (
              <div className="bg-zinc-900 rounded-xl p-8 border border-white/5 text-center">
                <p className="text-gray-400 mb-2">You were most active in</p>
                <p className="text-5xl font-bold mb-2">{yearData.most_watched_month}</p>
              </div>
            )}

            {/* Favorite Movie */}
            {yearData?.favorite_movie && (
              <div className="bg-zinc-900 rounded-xl p-8 border border-white/5 text-center">
                <Heart className="h-16 w-16 text-pink-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Your top-rated movie was</p>
                <p className="text-4xl font-bold mb-2">{yearData.favorite_movie.title}</p>
                <p className="text-2xl text-yellow-400">
                  {"★".repeat(yearData.favorite_movie.rating)}
                </p>
              </div>
            )}

            {/* Closing */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-12 text-center border border-white/5">
              <p className="text-3xl font-bold mb-4">
                Thanks for being part of MovieMate in {selectedYear}!
              </p>
              <p className="text-xl text-gray-400">
                Here's to even more movies in the year ahead
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
