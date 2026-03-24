import { useState, useEffect, useCallback } from "react";
import { api } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 20;

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalFetched, setTotalFetched] = useState(0);

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const languages = ["English", "Spanish", "French", "German", "Korean", "Japanese", "Hindi", "Italian"];

  useEffect(() => {
    api.get("/genres").then((res) => setGenres(res.data)).catch(console.error);
  }, []);

  const fetchMovies = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedGenre) params.append("genre", selectedGenre);
      if (selectedLanguage) params.append("language", selectedLanguage);
      if (sortBy) { params.append("sort_by", sortBy); params.append("order", sortOrder); }
      params.append("limit", PAGE_SIZE);
      params.append("skip", (pageNum - 1) * PAGE_SIZE);

      const res = await api.get(`/movies?${params.toString()}`);
      setMovies(res.data);
      setHasMore(res.data.length === PAGE_SIZE);
      setTotalFetched((pageNum - 1) * PAGE_SIZE + res.data.length);
    } catch (error) {
      console.error("Failed to fetch movies", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedGenre, selectedLanguage, sortBy, sortOrder]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
    fetchMovies(1);
  }, [searchQuery, selectedGenre, selectedLanguage, sortBy, sortOrder]);

  const goToPage = (newPage) => {
    setPage(newPage);
    fetchMovies(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchQuery(""); setSelectedGenre(""); setSelectedLanguage(""); setSortBy("");
  };

  const sel = "bg-zinc-900 border border-white/10 text-white text-sm rounded-lg p-2 focus:ring-primary focus:border-primary outline-none";

  return (
    <div className="min-h-screen bg-secondary pb-20">
      <Navbar />

      <div className="pt-24 mx-auto max-w-7xl px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">All Movies</h1>
            {!loading && (
              <p className="text-sm text-gray-500 mt-1">
                Showing {(page - 1) * PAGE_SIZE + 1}–{totalFetched} movies
                {!hasMore && movies.length > 0 ? " (end of results)" : ""}
              </p>
            )}
          </div>

          {/* Filters & Sort Toolbar */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search movies..."
              className={`${sel} flex-grow min-w-[200px]`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select className={sel} value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
              <option value="">All Genres</option>
              {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select className={sel} value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
              <option value="">All Languages</option>
              {languages.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select className={sel} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="">Sort By (Default)</option>
              <option value="imdb_rating">Highest Rated</option>
              <option value="release_date">Release Date</option>
              <option value="title">Title (A-Z)</option>
            </select>
            {sortBy && (
              <select className={sel} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            )}
          </div>
        </div>

        {/* Movie Grid */}
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
              {movies.length === 0 && (
                <div className="col-span-full py-20 text-center border border-dashed border-gray-800 rounded-xl bg-zinc-900/30">
                  <p className="text-gray-400 font-medium mb-1">No movies found matching your criteria</p>
                  <p className="text-sm text-gray-500">Try adjusting your filters or search terms.</p>
                  <button onClick={clearFilters} className="mt-4 text-primary text-sm hover:underline">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {movies.length > 0 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-gray-800 rounded-xl text-white text-sm font-medium hover:border-primary hover:text-primary transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-800 disabled:hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                {/* Page Number Pills */}
                <div className="flex items-center gap-1">
                  {page > 2 && (
                    <>
                      <PagePill num={1} current={page} onClick={goToPage} />
                      {page > 3 && <span className="text-gray-600 px-1">…</span>}
                    </>
                  )}
                  {page > 1 && <PagePill num={page - 1} current={page} onClick={goToPage} />}
                  <PagePill num={page} current={page} onClick={goToPage} />
                  {hasMore && <PagePill num={page + 1} current={page} onClick={goToPage} />}
                </div>

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={!hasMore}
                  className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-gray-800 rounded-xl text-white text-sm font-medium hover:border-primary hover:text-primary transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-800 disabled:hover:text-white"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PagePill({ num, current, onClick }) {
  const isActive = num === current;
  return (
    <button
      onClick={() => onClick(num)}
      className={`h-9 w-9 rounded-lg text-sm font-bold transition ${
        isActive
          ? "bg-primary text-white shadow-[0_0_12px_rgba(229,9,20,0.5)]"
          : "bg-zinc-900 border border-gray-800 text-gray-400 hover:border-primary hover:text-white"
      }`}
    >
      {num}
    </button>
  );
}
