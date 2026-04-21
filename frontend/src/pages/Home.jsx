import { useState, useEffect, useRef } from "react";
import { api, useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PreferencesModal from "../components/PreferencesModal";
import { ChevronLeft, ChevronRight } from "lucide-react";

function MovieRow({ title, movies, showGenerate = false, onGenerate = null }) {
  const [isHovered, setIsHovered] = useState(false);

  const scroll = (direction) => {
    const container = document.getElementById(`scroll-${title.replace(/\s+/g, '-')}`);
    if (container) {
      const scrollAmount = container.clientWidth * 0.6;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4 pr-8">
        <h2 className="text-xl font-semibold text-white md:text-2xl">{title}</h2>
        {showGenerate && onGenerate && (
          <button
            onClick={onGenerate}
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
        )}
      </div>
      <div className="relative">
        {/* Movies Container */}
        <div
          id={`scroll-${title.replace(/\s+/g, '-')}`}
          className="flex gap-4 overflow-x-scroll pb-4 scrollbar-hide"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-36 md:w-44">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Scroll Buttons */}
        <button
          onClick={() => scroll("left")}
          className={`absolute left-0 top-0 bottom-4 z-10 flex items-center justify-center w-10 h-full transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.8), transparent)" }}
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={() => scroll("right")}
          className={`absolute right-0 top-0 bottom-4 z-10 flex items-center justify-center w-10 h-full transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          style={{ background: "linear-gradient(to left, rgba(0,0,0,0.8), transparent)" }}
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>
    </section>
  );
}

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
          <MovieRow
            title="Recommended For You"
            movies={recommendations}
            showGenerate={true}
            onGenerate={async () => {
              try {
                await api.post("/recommendations/generate");
                alert(
                  "AI is analyzing your profile! You will receive a notification when it's done.",
                );
              } catch (err) {
                console.error(err);
              }
            }}
          />
        )}

        {/* Trending Row */}
        <MovieRow title="Trending Now" movies={trending} />

        {/* Genre Rows */}
        {genres.slice(0, 3).map((genre) => {
          const genreMovies = trending.filter((m) => m.genre_ids.includes(genre.id));
          if (genreMovies.length === 0) return null;
          return (
            <MovieRow
              key={genre.id}
              title={`${genre.name} Movies`}
              movies={genreMovies}
            />
          );
        })}
      </div>

      <PreferencesModal
        isOpen={showPrefs}
        onClose={() => setShowPrefs(false)}
        onSave={handlePrefsSaved}
      />
    </div>
  );
}
