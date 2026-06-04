import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon, TrendingUp } from "lucide-react";
import { api } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import SearchFilters from "../components/SearchFilters";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../context/ToastContext";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const observerRef = useRef();

  const LIMIT = 20;

  // Load genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await api.get("/genres/");
        setGenres(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGenres();

    // Load trending searches from localStorage
    const trending = JSON.parse(localStorage.getItem("trendingSearches") || "[]");
    setTrendingSearches(trending.slice(0, 5));
  }, []);

  // Perform search
  const performSearch = useCallback(
    async (resetPage = false) => {
      const currentPage = resetPage ? 0 : page;
      setLoading(true);
      try {
        const params = {
          query: query || undefined,
          ...filters,
          limit: LIMIT,
          skip: currentPage * LIMIT,
        };

        // Clean undefined params
        Object.keys(params).forEach((key) => {
          if (params[key] === undefined || params[key] === "") {
            delete params[key];
          }
        });

        const res = await api.get("/search/movies", { params });
        const newMovies = res.data.results;

        if (resetPage) {
          setMovies(newMovies);
          setPage(0);
        } else {
          setMovies((prev) => [...prev, ...newMovies]);
        }

        setTotal(res.data.total);
        setHasMore(newMovies.length === LIMIT);

        // Save to search history
        if (query) {
          saveSearchToHistory(query);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to search movies");
      } finally {
        setLoading(false);
      }
    },
    [query, filters, page, toast]
  );

  // Search when query or filters change
  useEffect(() => {
    performSearch(true);
  }, [query, filters]);

  // Infinite scroll observer
  const lastMovieRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore]
  );

  // Load more when page changes
  useEffect(() => {
    if (page > 0) {
      performSearch(false);
    }
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
    performSearch(true);
  };

  const saveSearchToHistory = (searchQuery) => {
    const history = JSON.parse(localStorage.getItem("trendingSearches") || "[]");
    const updated = [searchQuery, ...history.filter((s) => s !== searchQuery)].slice(0, 10);
    localStorage.setItem("trendingSearches", JSON.stringify(updated));
    setTrendingSearches(updated.slice(0, 5));
  };

  const handleTrendingClick = (term) => {
    setQuery(term);
    setSearchParams({ q: term });
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-3xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-full px-6 py-4 pl-14 text-white text-lg focus:outline-none focus:border-primary transition"
            />
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500" />
          </div>
        </form>

        {/* Trending Searches */}
        {trendingSearches.length > 0 && !query && (
          <div className="mb-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-gray-400">Recent Searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTrendingClick(term)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-gray-300 px-4 py-2 rounded-full text-sm transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters onFilterChange={setFilters} genres={genres} />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">
                {query ? `Search Results for "${query}"` : "All Movies"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {total} {total === 1 ? "movie" : "movies"} found
              </p>
            </div>

            {/* Movies Grid */}
            {loading && page === 0 ? (
              <LoadingSpinner />
            ) : movies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {movies.map((movie, idx) => {
                  if (idx === movies.length - 1) {
                    return (
                      <div key={movie.id} ref={lastMovieRef}>
                        <MovieCard movie={movie} />
                      </div>
                    );
                  }
                  return <MovieCard key={movie.id} movie={movie} />;
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <SearchIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No movies found</p>
                <p className="text-gray-600 text-sm mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}

            {/* Loading More */}
            {loading && page > 0 && (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-primary"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
