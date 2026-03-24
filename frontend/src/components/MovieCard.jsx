import { Play, Plus, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {
  // Handle poster path gracefully
  const posterUrl = movie.poster_url
    ? movie.poster_url
    : `https://via.placeholder.com/300x450?text=${encodeURIComponent(movie.title)}`;

  return (
    <Link to={`/movie/${movie.id}`}>
      <div className="group relative cursor-pointer">
        {/* Base card — scales up on hover */}
        <div className="overflow-hidden rounded-lg transition-transform duration-300 ease-out group-hover:scale-105 group-hover:shadow-2xl">
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover aspect-[2/3]"
          />
        </div>

        {/* Hover Info Card — fades in below the poster */}
        <div className="pointer-events-none absolute left-0 right-0 top-full z-20 translate-y-1 rounded-b-xl bg-zinc-900 px-4 py-3 opacity-0 shadow-2xl ring-1 ring-white/5 transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
          <h3 className="text-sm font-bold text-white truncate">{movie.title}</h3>

          <div className="mt-1 flex items-center gap-2 text-[11px]">
            <span className="text-green-400 font-semibold">
              {Math.round(movie.imdb_rating * 10)}% Match
            </span>
            <span className="text-gray-500">{movie.runtime} min</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {movie.genres?.slice(0, 3).map((g) => (
              <span key={g.id} className="rounded-full bg-zinc-800 px-2 py-0.5 text-[9px] text-gray-400 border border-white/5">
                {g.name}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition">
              <Play className="h-3.5 w-3.5 fill-current" />
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-600 hover:border-white transition">
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-600 hover:border-white transition">
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
