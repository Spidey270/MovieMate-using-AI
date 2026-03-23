import { useEffect, useState } from "react";
import { api } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get("/wishlist/");
        setWishlist(res.data);
      } catch (error) {
        console.error("Failed to load wishlist", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-secondary text-white pb-20">
      <Navbar />

      <div className="pt-24 mx-auto max-w-6xl px-4">
        <h1 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-4">
          My Wishlist
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 transition-all hover:bg-zinc-900 group flex flex-col"
            >
              <Link to={`/movie/${item.movie_id}`} className="flex-grow">
                <div className="aspect-[2/3] bg-zinc-800 rounded-lg mb-4 flex items-center justify-center text-center p-4 font-bold text-gray-500 overflow-hidden hover:text-white transition-colors">
                  {item.movie_title}
                </div>
              </Link>
              <Button
                variant="ghost"
                className="w-full text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10 mt-auto"
                onClick={async () => {
                  try {
                    await api.delete(`/wishlist/${item.movie_id}`);
                    setWishlist(
                      wishlist.filter((w) => w.movie_id !== item.movie_id),
                    );
                  } catch (e) {
                    alert("Failed to remove from wishlist");
                  }
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          {wishlist.length === 0 && (
            <div className="col-span-full text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/5">
              <h2 className="text-xl font-bold text-gray-400 mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-gray-500 mb-6">
                Keep track of movies you want to watch soon.
              </p>
              <Link to="/movies">
                <Button className="bg-primary hover:bg-red-700">
                  Explore Movies
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
