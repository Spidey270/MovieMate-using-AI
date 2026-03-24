import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Star, Plus, Clock, Globe, Check } from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function MovieDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);

  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const movieRes = await api.get(`/movies/${id}`);
        setMovie(movieRes.data);

        // Fetch reviews
        try {
          const reviewsRes = await api.get(`/reviews/${id}`);
          setReviews(reviewsRes.data);
        } catch (e) {
          // console.log("No reviews yet or failed to fetch")
        }

        // Check Wishlist Status if user is logged in
        if (user) {
          try {
            const wishlistRes = await api.get("/wishlist/");
            const found = wishlistRes.data.some((item) => item.movie_id === id);
            setIsInWishlist(found);
          } catch (e) {
            console.error("Failed to check wishlist status");
          }
        }
      } catch (error) {
        console.error("Failed to fetch movie details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [id, user]);

  const handleWishlistToggle = async () => {
    if (!user) {
      alert("Please login to add movies to your wishlist.");
      return;
    }
    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${id}`);
        setIsInWishlist(false);
        // alert("Removed from wishlist")
      } else {
        await api.post("/wishlist/", { movie_id: id });
        setIsInWishlist(true);
        // alert("Added to wishlist!")
      }
    } catch (error) {
      alert("Failed to update wishlist");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post("/reviews/", {
        movie_id: id,
        rating: parseInt(rating),
        comment: newReview,
      });
      // Refresh reviews
      const res = await api.get(`/reviews/${id}`);
      setReviews(res.data);
      setNewReview("");
    } catch (error) {
      alert("Failed to post review");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!movie) return <div className="text-white">Movie not found</div>;

  const backdropUrl = movie.backdrop_url
    ? movie.backdrop_url
    : `https://via.placeholder.com/1920x1080?text=${encodeURIComponent(movie.title)}`;

  const posterUrl = movie.poster_url
    ? movie.poster_url
    : `https://via.placeholder.com/300x450?text=${encodeURIComponent(movie.title)}`;

  return (
    <div className="min-h-screen bg-secondary text-white pb-20">
      <Navbar />

      {/* Banner */}
      <div className="relative h-[50vh] w-full">
        <img
          src={backdropUrl}
          className="h-full w-full object-cover opacity-60"
          alt="Backdrop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent" />
      </div>

      <div className="mx-auto -mt-32 max-w-6xl px-4 relative z-10">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={posterUrl}
              alt={movie.title}
              className="h-[450px] w-[300px] rounded-lg shadow-2xl object-cover bg-zinc-800"
            />
          </div>

          {/* Details */}
          <div className="flex-grow pt-8">
            <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
            <div className="flex items-center gap-4 text-gray-400 text-sm mb-6">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {movie.runtime} min
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-4 w-4" /> {movie.language}
              </span>
              <span className="text-green-500 font-bold">
                {movie.imdb_rating} IMDb
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres?.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full bg-gray-800 px-3 py-1 text-xs"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-2xl">
              {movie.overview}
            </p>

            <div className="flex gap-4">
              <Button
                onClick={handleWishlistToggle}
                className={`flex items-center gap-2 ${isInWishlist ? "bg-gray-600 hover:bg-gray-700" : ""}`}
              >
                {isInWishlist ? (
                  <>
                    <Check className="h-5 w-5" /> In Wishlist
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" /> Add to Wishlist
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Trailer Section ───────────────────────────────────── */}
        {movie.trailer_url && (
          <div className="mt-14">
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-primary rounded-full" />
              Trailer
            </h2>
            <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-zinc-900" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={(() => {
                  const url = movie.trailer_url;
                  // Handle youtu.be short links
                  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
                  if (short) return `https://www.youtube.com/embed/${short[1]}?rel=0`;
                  // Handle youtube.com/watch?v=
                  const long = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
                  if (long) return `https://www.youtube.com/embed/${long[1]}?rel=0`;
                  // Already an embed URL — return as-is
                  return url;
                })()}
                title={`${movie.title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* ── Gallery Section ───────────────────────────────────── */}
        {(movie.backdrop_url || movie.poster_url) && (
          <div className="mt-14">
            <h2 className="text-2xl font-bold mb-5 flex items-center gap-3">
              <span className="inline-block w-1 h-6 bg-primary rounded-full" />
              Gallery
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Backdrop — spans 2 cols */}
              {movie.backdrop_url && (
                <a
                  href={movie.backdrop_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:col-span-2 group relative overflow-hidden rounded-xl bg-zinc-900 block"
                >
                  <img
                    src={movie.backdrop_url}
                    alt={`${movie.title} backdrop`}
                    className="w-full h-[250px] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  <span className="absolute bottom-3 left-3 text-xs text-white/70 bg-black/50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition">
                    Backdrop
                  </span>
                </a>
              )}
              {/* Poster */}
              {movie.poster_url && (
                <a
                  href={movie.poster_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-xl bg-zinc-900 block"
                >
                  <img
                    src={movie.poster_url}
                    alt={`${movie.title} poster`}
                    className="w-full h-[250px] object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  <span className="absolute bottom-3 left-3 text-xs text-white/70 bg-black/50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition">
                    Poster
                  </span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-16 max-w-4xl">

          <h2 className="text-2xl font-bold mb-6">Reviews</h2>

          {/* Add Review */}
          {user ? (
            <form
              onSubmit={handleSubmitReview}
              className="mb-10 bg-gray-900 p-6 rounded-lg"
            >
              <h3 className="mb-4 text-lg font-semibold">Leave a review</h3>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Rating
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="bg-gray-800 rounded p-2 text-white w-full md:w-32"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Stars
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="w-full bg-gray-800 rounded p-3 text-white mb-4 h-24"
                placeholder="Write your thoughts..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                required
              />
              <Button type="submit">Post Review</Button>
            </form>
          ) : (
            <div className="mb-10 bg-gray-900 p-6 rounded-lg text-center">
              <p className="text-gray-300">
                Please{" "}
                <a href="/login" className="text-primary underline">
                  login
                </a>{" "}
                to leave a review.
              </p>
            </div>
          )}

          {/* Review List */}
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div
                key={review.id || index}
                className="border-b border-gray-800 pb-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/user/${review.user_id}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 font-bold hover:bg-primary transition"
                    >
                      {review.username[0].toUpperCase()}
                    </Link>
                    <div>
                      <Link
                        to={`/user/${review.user_id}`}
                        className="font-bold hover:text-primary transition"
                      >
                        {review.username}
                      </Link>
                      <div className="text-gray-500 text-xs">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm">{review.rating}</span>
                  </div>
                </div>
                <p className="text-gray-300">{review.comment || review.text}</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-gray-500">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
