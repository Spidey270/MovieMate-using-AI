import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import { ArrowLeft, Film, Star } from "lucide-react";

export default function CollectionDetail() {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchCollection();
  }, [id]);

  const fetchCollection = async () => {
    try {
      const response = await api.get(`/collections/${id}`);
      setCollection(response.data);
    } catch (error) {
      addToast("Failed to load collection", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!collection) return <div className="text-white">Collection not found</div>;

  return (
    <div className="min-h-screen bg-secondary text-white pb-20">
      <Navbar />

      <div className="pt-24 mx-auto max-w-7xl px-4">
        <Link
          to="/collections"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Collections
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{collection.name}</h1>
          {collection.description && (
            <p className="text-gray-400">{collection.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {collection.movies?.length || 0} movies
          </p>
        </div>

        {collection.movies && collection.movies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {collection.movies.map((movie) => (
              <Link key={movie.id} to={`/movie/${movie.id}`} className="group">
                <div className="bg-zinc-900 rounded-lg overflow-hidden border border-white/5 hover:border-primary/50 transition">
                  <img
                    src={
                      movie.poster_url ||
                      `https://via.placeholder.com/300x450?text=${encodeURIComponent(
                        movie.title
                      )}`
                    }
                    alt={movie.title}
                    className="w-full h-72 object-cover"
                    loading="lazy"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-sm line-clamp-1 mb-2">
                      {movie.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-yellow-400">
                      <Star className="h-3 w-3 fill-yellow-400" />
                      <span>{movie.imdb_rating || "N/A"}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {movie.genres?.slice(0, 2).map((genre) => (
                        <span
                          key={genre.id}
                          className="text-xs bg-zinc-800 px-2 py-1 rounded"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-xl p-12 text-center border border-white/5">
            <Film className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400">No movies in this collection yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
