import { Play, Info } from "lucide-react";
import { Button } from "./ui/button";

export default function Hero({ movie }) {
  if (!movie) return null;

  const posterUrl = movie.backdrop_url
    || movie.poster_url
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(movie.title)}&background=111111&color=fff&size=1920`;

  return (
    <div className="relative h-[80vh] w-full">
      <div className="absolute inset-0">
        <img
          src={posterUrl}
          alt={movie.title}
          className="h-full w-full object-cover"
          onError={(e) => { e.target.src = movie.poster_url || ""; }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent" />
      </div>

      <div className="absolute top-[30%] left-4 max-w-xl p-8 md:!left-12">
        <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">
          {movie.title}
        </h1>
        <p className="mb-6 text-lg text-gray-300 drop-shadow-md line-clamp-3">
          {movie.overview}
        </p>

        <div className="flex gap-4">
          <Button className="flex items-center gap-2 bg-white px-8 py-6 text-xl font-bold text-black hover:bg-gray-200">
            <Play className="h-6 w-6 fill-black" />
            Play
          </Button>
          <Button
            variant="secondary"
            className="flex items-center gap-2 bg-gray-500/70 px-8 py-6 text-xl font-bold text-white hover:bg-gray-500/50"
          >
            <Info className="h-6 w-6" />
            More Info
          </Button>
        </div>
      </div>
    </div>
  );
}
