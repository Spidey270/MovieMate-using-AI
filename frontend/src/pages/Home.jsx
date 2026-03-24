import { useState, useEffect } from "react";
import { api, useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PreferencesModal from "../components/PreferencesModal";

export default function Home() {
  const { user } = useAuth();
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recsRes, trendRes, genresRes] = await Promise.all([
          api.get("/recommendations"),
          api.get("/movies"),
          api.get("/genres"),
        ]);

        setRecommendations(recsRes.data);
        setTrending(trendRes.data);
        setGenres(genresRes.data);

        // Pick random featured movie from trending
        if (trendRes.data.length > 0) {
          const random = Math.floor(Math.random() * trendRes.data.length);
          setFeaturedMovie(trendRes.data[random]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handlePrefsSaved = () => {
    // Refresh recommendations
    api.get("/recommendations").then((res) => setRecommendations(res.data));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-secondary pb-20">
      <Navbar />
      <Hero movie={featuredMovie} />

      <div className="relative z-20 -mt-32 space-y-8 pl-4 md:pl-12">
        {/* Recommendations Row */}
        {user && (
          <section>
            <div className="flex items-center justify-between mb-4 pr-8">
              <h2 className="text-xl font-semibold text-white md:text-2xl">
                Recommended For You
              </h2>
              <button
                onClick={async () => {
                  try {
                    await api.post("/recommendations/generate");
                    alert(
                      "AI is analyzing your profile! You will receive a notification when it's done.",
                    );
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="bg-primary/20 text-primary hover:bg-primary/30 px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-2 border border-primary/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-sparkles"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  <path d="M5 3v4" />
                  <path d="M19 17v4" />
                  <path d="M3 5h4" />
                  <path d="M17 19h4" />
                </svg>
                Generate AI Recommendations
              </button>
            </div>
            {recommendations.length > 0 ? (
              <div className="flex gap-4 overflow-x-scroll pb-4 scrollbar-hide">
                {recommendations.map((movie) => (
                  <div key={movie.id} className="flex-shrink-0 w-36 md:w-44">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                No recommendations yet. Click generate to get started!
              </div>
            )}
          </section>
        )}

        {/* Trending Row */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white md:text-2xl">
            Trending Now
          </h2>
          <div className="flex gap-4 overflow-x-scroll pb-4 scrollbar-hide">
            {trending.map((movie) => (
              <div key={movie.id} className="flex-shrink-0 w-36 md:w-44">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        </section>

        {/* Just placeholder rows for genres for now */}
        {genres.slice(0, 3).map((genre) => (
          <section key={genre.id}>
            <h2 className="mb-4 text-xl font-semibold text-white md:text-2xl">
              {genre.name} Movies
            </h2>
            <div className="flex gap-4 overflow-x-scroll pb-4 scrollbar-hide">
              {trending
                .filter((m) => m.genre_ids.includes(genre.id))
                .map((movie) => (
                  <div key={movie.id} className="flex-shrink-0 w-36 md:w-44">
                    <MovieCard movie={movie} />
                  </div>
                ))}
              {/* Fallback if empty */}
              {trending.filter((m) => m.genre_ids.includes(genre.id)).length ===
                0 && (
                <p className="text-sm text-gray-500">
                  No movies in this genre yet.
                </p>
              )}
            </div>
          </section>
        ))}
      </div>

      <PreferencesModal
        isOpen={showPrefs}
        onClose={() => setShowPrefs(false)}
        onSave={handlePrefsSaved}
      />
    </div>
  );
}
