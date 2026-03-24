import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import {
  ArrowLeft, Shield, ShieldOff, Trash2, Star, Film, Heart, Users
} from "lucide-react";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/admin/users/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error("Failed to load user", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handlePromote = async () => {
    setActing(true);
    try {
      const res = await api.patch(`/admin/users/${id}/promote`);
      setUser((u) => ({ ...u, is_admin: res.data.is_admin }));
      alert(res.data.message);
    } catch {
      alert("Failed to update user role.");
    } finally {
      setActing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Permanently delete ${user.username}? All their reviews and wishlist will be wiped.`)) return;
    setActing(true);
    try {
      await api.delete(`/admin/users/${id}`);
      alert("User deleted.");
      navigate("/admin/users");
    } catch {
      alert("Failed to delete user.");
      setActing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-secondary flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <div className="min-h-screen bg-secondary flex items-center justify-center text-white">User not found.</div>;

  return (
    <div className="min-h-screen bg-secondary pb-20">
      <Navbar />
      <div className="pt-24 mx-auto max-w-5xl px-4">
        <div className="mb-8 flex items-center gap-4 border-b border-gray-800 pb-4">
          <Link to="/admin/users" className="text-gray-400 hover:text-white transition">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-white">User Detail</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-zinc-900 border border-gray-800 rounded-xl p-6 mb-6 flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-amber-500/20 flex items-center justify-center text-4xl font-bold text-amber-400">
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white">{user.username}</h2>
              {user.is_admin && (
                <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <div className="flex gap-6 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Film className="h-4 w-4" /> {user.review_count} Reviews</span>
              <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> {user.wishlist_count} Wishlists</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {user.friend_count} Friends</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={handlePromote}
              disabled={acting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition disabled:opacity-50 ${
                user.is_admin
                  ? "bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-gray-700"
                  : "bg-amber-500 text-black hover:bg-amber-600"
              }`}
            >
              {user.is_admin ? <><ShieldOff className="h-4 w-4" /> Demote</> : <><Shield className="h-4 w-4" /> Promote to Admin</>}
            </button>
            <button
              onClick={handleDelete}
              disabled={acting}
              className="flex items-center gap-2 bg-red-900/30 border border-red-700/40 text-red-400 hover:bg-red-900/50 px-5 py-2.5 rounded-lg font-bold text-sm transition disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> Delete Account
            </button>
          </div>
        </div>

        {/* Genres */}
        {user.favorite_genres?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Favourite Genres</h3>
            <div className="flex flex-wrap gap-2">
              {user.favorite_genres.map((g) => (
                <span key={g} className="bg-zinc-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-700">{g}</span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Reviews</h3>
        {user.reviews?.length === 0 ? (
          <p className="text-gray-600 text-sm mb-6">No reviews written yet.</p>
        ) : (
          <div className="space-y-3 mb-6">
            {user.reviews.slice(0, 10).map((r) => (
              <div key={r.id} className="bg-zinc-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-grow">
                  <Link to={`/movie/${r.movie_id}`} className="text-sm font-bold text-primary hover:underline">
                    {r.movie_title}
                  </Link>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-1">{r.comment || r.text}</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-400 text-sm flex-shrink-0">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {r.rating}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
