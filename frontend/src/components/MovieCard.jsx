import { Link } from "react-router-dom";
import { Play, Star } from "lucide-react";

export default function MovieCard({ movie }) {
  const posterUrl = movie.poster_url
    ? movie.poster_url
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(movie.title)}&background=18181b&color=fff&size=300`;

  return (
    <Link to={`/movie/${movie.id}`} className="group block w-full">
      {/* Outer: uniform aspect ratio, handles the hover scale — NO overflow-hidden so scale isn't clipped */}
      <div className="relative w-full aspect-[2/3] rounded-xl bg-zinc-800 shadow-lg transition-transform duration-300 ease-out group-hover:scale-105 group-hover:shadow-2xl group-hover:z-10">

        {/* Inner container: clips the image to the rounded card shape */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(movie.title)}&background=18181b&color=fff&size=300`;
            }}
          />
        </div>

        {/* Gradient — always visible at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent rounded-b-xl pointer-events-none" />

        {/* Title — always shown */}
        <div className="absolute inset-x-0 bottom-0 p-3 pointer-events-none">
          <p className="text-sm font-bold text-white leading-tight line-clamp-2">{movie.title}</p>
        </div>

        {/* Hover overlay — fades in over the poster */}
        <div className="absolute inset-0 flex flex-col justify-end rounded-xl bg-gradient-to-t from-black via-black/80 to-black/20 p-4 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
            <span className="text-yellow-400 text-xs font-bold">{movie.imdb_rating?.toFixed(1)}</span>
            <span className="text-gray-400 text-xs ml-auto">{movie.runtime} min</span>
          </div>

          <h3 className="text-sm font-bold text-white leading-tight mb-1.5 line-clamp-2">{movie.title}</h3>

          <div className="flex flex-wrap gap-1 mb-3">
            {movie.genres?.slice(0, 2).map((g) => (
              <span key={g.id} className="text-[9px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                {g.name}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
              <Play className="h-3 w-3 fill-current" /> Watch
            </span>
            <span className="text-[10px] text-gray-400">More Info →</span>
          </div>
        </div>

      </div>
    </Link>
  );
}
