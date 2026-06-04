import { useState, useEffect } from "react";
import { X, Filter } from "lucide-react";

export default function SearchFilters({ onFilterChange, genres = [] }) {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [ratingMin, setRatingMin] = useState("");
  const [language, setLanguage] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Notify parent of filter changes
    onFilterChange({
      genres: selectedGenres.join(","),
      year_min: yearMin || undefined,
      year_max: yearMax || undefined,
      rating_min: ratingMin || undefined,
      language: language || undefined,
      sort_by: sortBy,
    });
  }, [selectedGenres, yearMin, yearMax, ratingMin, language, sortBy]);

  const toggleGenre = (genreName) => {
    setSelectedGenres((prev) =>
      prev.includes(genreName)
        ? prev.filter((g) => g !== genreName)
        : [...prev, genreName]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setYearMin("");
    setYearMax("");
    setRatingMin("");
    setLanguage("");
    setSortBy("rating");
  };

  const hasActiveFilters = selectedGenres.length > 0 || yearMin || yearMax || ratingMin || language;

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-lg overflow-hidden">
      {/* Filter Header */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="font-bold text-white">Filters</span>
          {hasActiveFilters && (
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
        <span className="text-gray-500">
          {showFilters ? "Hide" : "Show"}
        </span>
      </button>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 border-t border-white/10 space-y-4">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            >
              <option value="rating">Highest Rated</option>
              <option value="year">Most Recent</option>
              <option value="title">Title (A-Z)</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                    selectedGenres.includes(genre.name)
                      ? "bg-primary text-white"
                      : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          {/* Year Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Year Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min (e.g., 2000)"
                value={yearMin}
                onChange={(e) => setYearMin(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              />
              <input
                type="number"
                placeholder="Max (e.g., 2024)"
                value={yearMax}
                onChange={(e) => setYearMax(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Minimum Rating
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="e.g., 7.5"
              value={ratingMin}
              onChange={(e) => setRatingMin(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>

          {/* Language Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Language
            </label>
            <input
              type="text"
              placeholder="e.g., English, Spanish"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-gray-300 py-2 rounded-lg transition"
            >
              <X className="h-4 w-4" />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
