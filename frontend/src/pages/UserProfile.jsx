import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Button } from "../components/ui/button";
import { UserPlus, Check, MessageSquare } from "lucide-react";

export default function UserProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState(null); // null, 'pending', 'accepted'

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setUser(res.data);

        if (currentUser) {
          // Check friend status
          const friends = await api.get("/friends/");
          const isFriend = friends.data.find((f) => f.user_id === id);
          if (isFriend) {
            setFriendStatus("accepted");
          } else {
            const requests = await api.get("/friends/requests");
            const isPending = requests.data.find(
              (r) => r.sender_id === id || r.receiver_id === id,
            );
            if (isPending) setFriendStatus("pending");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, currentUser]);

  const handleAddFriend = async () => {
    try {
      await api.post(`/friends/request/${id}`);
      setFriendStatus("pending");
      alert("Friend request sent!");
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to send request");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!user)
    return <div className="text-white text-center mt-20">User not found</div>;

  return (
    <div className="min-h-screen bg-secondary text-white pb-20">
      <Navbar />

      <div className="pt-24 mx-auto max-w-4xl px-4">
        <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl border border-white/5">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center text-5xl font-bold shadow-2xl">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{user.username}</h1>
              <p className="text-gray-400 mb-6">MovieMate Member</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {currentUser && currentUser.id !== id && (
                  <>
                    {friendStatus === "accepted" ? (
                      <Button
                        disabled
                        className="bg-green-600/20 text-green-500 border border-green-500/50"
                      >
                        <Check className="mr-2 h-4 w-4" /> Friends
                      </Button>
                    ) : friendStatus === "pending" ? (
                      <Button disabled className="bg-zinc-800 text-gray-500">
                        Pending Request
                      </Button>
                    ) : (
                      <Button
                        onClick={handleAddFriend}
                        className="bg-primary hover:bg-red-700"
                      >
                        <UserPlus className="mr-2 h-4 w-4" /> Add Friend
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="border-gray-700 hover:bg-gray-800"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" /> Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-8 border-l border-gray-800 pl-8 hidden md:flex">
              <div className="text-center">
                <div className="text-2xl font-bold">{user.wishlist_count}</div>
                <div className="text-xs text-gray-500 uppercase">Wishlist</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user.review_count}</div>
                <div className="text-xs text-gray-500 uppercase">Reviews</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-800">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Favorite Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.favorite_genres?.length > 0 ? (
                  user.favorite_genres.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-gray-300"
                    >
                      {g}{" "}
                      {/* Note: These are IDs, ideally we should resolve them to names */}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-600 text-sm italic">
                    No genres selected
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Top Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.favorite_languages?.length > 0 ? (
                  user.favorite_languages.map((l) => (
                    <span
                      key={l}
                      className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-gray-300"
                    >
                      {l}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-600 text-sm italic">
                    No languages selected
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
