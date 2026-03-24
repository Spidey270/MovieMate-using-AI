import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { ArrowLeft, MessageSquare, Trash2, Star } from "lucide-react";

export default function ModerateReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await api.get("/admin/reviews?limit=100");
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Failed to delete review.");
    }
  };

  return (
    <div className="min-h-screen bg-secondary pb-20">
      <Navbar />
      <div className="pt-24 mx-auto max-w-5xl px-4">
        <div className="mb-8 flex items-center gap-4 border-b border-gray-800 pb-4">
          <Link to="/admin/dashboard" className="text-gray-400 hover:text-white transition">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-green-400" /> Review Moderation
          </h1>
          <span className="ml-auto bg-zinc-800 text-gray-400 text-sm px-3 py-1 rounded-full">
            {reviews.length} reviews
          </span>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-20">No reviews found.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-zinc-900 border border-gray-800 rounded-xl p-5 flex gap-4 hover:border-red-500/20 transition group">
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-bold text-white">{r.username}</span>
                    <span className="text-gray-500 text-xs">on</span>
                    <Link
                      to={`/movie/${r.movie_id}`}
                      className="text-primary hover:underline text-sm font-medium truncate max-w-[200px]"
                    >
                      {r.movie_title || r.movie_id}
                    </Link>
                    <span className="ml-auto flex items-center gap-1 text-yellow-400 text-sm">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {r.rating}/5
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{r.comment || r.text}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="flex-shrink-0 text-gray-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100 self-center"
                  title="Delete Review"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
