import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api, useAuth } from "../context/AuthContext";
import { Play, Film, Star, Clock, Globe, Plus, Check,
         Tv, ChevronRight, ArrowLeft } from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// Platform brand colours
const PLATFORM_STYLES = {
  Netflix:   "bg-[#E50914]",
  Prime:     "bg-[#00A8E0]",
  "Disney+": "bg-[#0063E5]",
  "Apple TV+":"bg-zinc-600",
  "HBO Max":  "bg-[#5822B4]",
};

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return `https://www.youtube.com/embed/${short[1]}?autoplay=1&rel=0`;
  const long = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (long) return `https://www.youtube.com/embed/${long[1]}?autoplay=1&rel=0`;
  if (url.includes("youtube.com/embed/")) return url + "?autoplay=1&rel=0";
  return null;
}

export default function Watch() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [links, setLinks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("full"); // "full" | "trailer"
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [relatedMovies, setRelatedMovies] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [movieRes, linksRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/streaming/links/${id}`),
        ]);
        setMovie(movieRes.data);
        setLinks(linksRes.data);

        // Default tab: full movie if IMDB ID or archive exists, else trailer
        setActiveTab(movieRes.data.imdb_id || movieRes.data.archive_url ? "full" : "trailer");

        // Log watch
        if (user) {
          api.post(`/streaming/watch/${id}`).catch(() => {});
        }

        // Check wishlist
        if (user) {
          const wRes = await api.get("/wishlist/");
          setIsInWishlist(wRes.data.some((w) => w.movie_id === id));
        }

        // Related movies (top rated, excluding this one)
        const movRes = await api.get("/movies/?limit=8");
        setRelatedMovies(movRes.data.filter((m) => m.id !== id).slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, user]);

  const handleWishlist = async () => {
    if (!user) { navigate("/login"); return; }
    if (isInWishlist) {
      await api.delete(`/wishlist/${id}`);
      setIsInWishlist(false);
    } else {
      await api.post("/wishlist/", { movie_id: id });
      setIsInWishlist(true);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!movie) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      Movie not found. <Link to="/movies" className="ml-2 text-primary underline">Browse movies</Link>
    </div>
  );

  const trailerEmbed = getYouTubeEmbedUrl(movie.trailer_url);
  const hasFullMovie  = !!(movie.imdb_id || movie.archive_url);
  const hasTrailer    = !!trailerEmbed;

  const embedSrc = activeTab === "full" && hasFullMovie
    ? (movie.imdb_id ? `https://vidsrc.xyz/embed/movie/${movie.imdb_id}` : movie.archive_url)
    : trailerEmbed;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* ─── Top bar ─── */}
      <div className="flex items-center gap-4 px-6 py-4 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Link to="/" className="text-xl font-black text-primary tracking-tight">MovieMate</Link>
        <span className="text-gray-600">|</span>
        <span className="text-sm text-gray-300 truncate">{movie.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* ─── PLAYER ─── */}
        <div className="flex-1 flex flex-col">
          {/* Tab switcher */}
          {(hasFullMovie || hasTrailer) && (
            <div className="flex gap-1 bg-zinc-900 px-4 pt-3">
              {hasFullMovie && (
                <button
                  onClick={() => setActiveTab("full")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-semibold transition ${
                    activeTab === "full"
                      ? "bg-black text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <Tv className="h-4 w-4" />
                  Full Movie
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/30">FREE</span>
                </button>
              )}
              {hasTrailer && (
                <button
                  onClick={() => setActiveTab("trailer")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-semibold transition ${
                    activeTab === "trailer"
                      ? "bg-black text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <Play className="h-4 w-4" />
                  Trailer
                </button>
              )}
            </div>
          )}

          {/* Video Player */}
          <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
            {embedSrc ? (
              <iframe
                key={embedSrc}
                src={embedSrc}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
                allowFullScreen
                title={movie.title}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-500">
                <Film className="h-16 w-16 opacity-30" />
                <p className="text-sm">No video available yet</p>
              </div>
            )}
          </div>

          {/* Movie Info (below player) */}
          <div className="bg-zinc-950 px-6 py-5 border-t border-white/5">
            <div className="flex flex-col md:flex-row md:items-start gap-4 max-w-4xl">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">{movie.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-3">
                  {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
                  {movie.runtime && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{movie.runtime} min</span>}
                  {movie.language && <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{movie.language}</span>}
                  {movie.imdb_rating && (
                    <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-current" />⭐ {movie.imdb_rating} IMDb
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {movie.genres?.map((g) => (
                    <span key={g.id} className="bg-zinc-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-white/5">{g.name}</span>
                  ))}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{movie.overview}</p>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-3 flex-shrink-0">
                <button
                  onClick={handleWishlist}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
                    isInWishlist
                      ? "bg-zinc-700 text-gray-300 hover:bg-zinc-600"
                      : "bg-primary hover:bg-red-700 text-white"
                  }`}
                >
                  {isInWishlist ? <><Check className="h-4 w-4" /> In Watchlist</> : <><Plus className="h-4 w-4" /> Add to Watchlist</>}
                </button>
                <Link
                  to={`/movie/${id}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-gray-300 transition"
                >
                  <Film className="h-4 w-4" /> Full Details
                </Link>
              </div>
            </div>

            {/* ─── Streaming Platform Links ─── */}
            {links?.platforms?.length > 0 && (
              <div className="mt-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">Also available on</p>
                <div className="flex flex-wrap gap-2">
                  {links.platforms.map((p) => (
                    <a
                      key={p.name}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition hover:opacity-80 hover:scale-105 ${PLATFORM_STYLES[p.name] || "bg-zinc-700"}`}
                    >
                      <span>{p.logo}</span>
                      <span>{p.name}</span>
                      <ChevronRight className="h-3 w-3 opacity-70" />
                    </a>
                  ))}
                </div>
                <p className="text-[10px] text-gray-600 mt-2">Links open the platform's search. Availability may vary by region.</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── SIDEBAR: Up Next ─── */}
        <div className="lg:w-80 xl:w-96 bg-zinc-950 border-l border-white/5 overflow-y-auto">
          <div className="p-4 border-b border-white/5">
            <h3 className="font-bold text-sm text-gray-300">More to Watch</h3>
          </div>
          <div className="divide-y divide-white/5">
            {relatedMovies.map((m) => (
              <Link
                key={m.id}
                to={`/watch/${m.id}`}
                className="flex gap-3 p-4 hover:bg-white/5 transition group"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={m.poster_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.title)}&background=27272a&color=fff`}
                    alt={m.title}
                    className="w-20 h-[60px] object-cover rounded-lg bg-zinc-800"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="bg-black/60 rounded-full p-1.5">
                      <Play className="h-4 w-4 fill-white text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-primary transition">{m.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{m.release_date?.slice(0, 4)} · ⭐ {m.imdb_rating}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{m.overview}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
