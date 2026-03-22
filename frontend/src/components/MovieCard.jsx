import { Play, Plus, ThumbsUp } from "lucide-react"
import { Link } from "react-router-dom"

export default function MovieCard({ movie }) {
    // Handle poster path gracefully
    const posterUrl = movie.poster_url
        ? movie.poster_url
        : `https://via.placeholder.com/300x450?text=${encodeURIComponent(movie.title)}`

    return (
        <Link to={`/movie/${movie.id}`}>
            <div className="group relative h-[180px] min-w-[300px] cursor-pointer transition-transform duration-200 hover:scale-105 md:h-[160px] md:min-w-[280px]">
                <img
                    src={posterUrl}
                    alt={movie.title}
                    className="h-full w-full rounded object-cover"
                />

                {/* Hover Info Card */}
                <div className="invisible absolute inset-0 z-10 flex flex-col justify-between rounded bg-zinc-900 p-4 opacity-0 shadow-lg transition-all duration-300 group-hover:visible group-hover:block group-hover:-translate-y-[20%] group-hover:scale-110 group-hover:opacity-100">
                    <img
                        src={posterUrl}
                        alt={movie.title}
                        className="mb-2 h-28 w-full rounded object-cover shadow-md"
                    />
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black hover:bg-gray-200">
                                <Play className="h-4 w-4 fill-current" />
                            </button>
                            <button className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-500 hover:border-white">
                                <Plus className="h-4 w-4" />
                            </button>
                            <button className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-500 hover:border-white">
                                <ThumbsUp className="h-4 w-4" />
                            </button>
                        </div>

                        <h3 className="text-sm font-bold text-white">{movie.title}</h3>

                        <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                            <span className="text-green-500">{Math.round(movie.imdb_rating * 10)}% Match</span>
                            <span>{movie.runtime} min</span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1">
                            {movie.genres?.slice(0, 3).map((g) => (
                                <span key={g.id} className="text-[8px] text-gray-300">
                                    {g.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
