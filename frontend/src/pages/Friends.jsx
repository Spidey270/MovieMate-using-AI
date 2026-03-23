import { useEffect, useState } from "react";
import { api } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { UserPlus, UserCheck, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const fetchData = async () => {
    try {
      const [friendsRes, reqRes] = await Promise.all([
        api.get("/friends/"),
        api.get("/friends/requests"),
      ]);
      setFriends(friendsRes.data);
      setRequests(reqRes.data);
    } catch (error) {
      console.error("Failed to load friend data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const acceptRequest = async (reqId) => {
    try {
      await api.post(`/friends/accept/${reqId}`);
      fetchData(); // Refresh lists
    } catch (error) {
      alert("Failed to accept request");
    }
  };

  const handleAddFriend = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      // Search for user by username
      const searchRes = await api.get(`/users/?q=${searchQuery}`);
      const targetUser = searchRes.data.find(
        (u) => u.username.toLowerCase() === searchQuery.toLowerCase(),
      );

      if (!targetUser) {
        alert("User not found");
        return;
      }

      await api.post(`/friends/request/${targetUser.id}`);
      alert("Friend request sent to " + targetUser.username);
      setSearchQuery("");
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to send request");
    } finally {
      setIsSearching(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-secondary text-white pb-20">
      <Navbar />

      <div className="pt-24 mx-auto max-w-5xl px-4">
        <h1 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-4">
          Social Hub
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Friends List & Search */}
          <div className="lg:col-span-2 space-y-8">
            {/* Add Friend */}
            <div className="p-6 bg-zinc-900 rounded-2xl border border-white/5 shadow-lg">
              <h3 className="font-bold mb-4 flex items-center text-primary text-lg">
                <UserPlus className="mr-2 h-5 w-5" /> Find Friends
              </h3>
              <div className="flex gap-4">
                <input
                  className="bg-black/40 border border-white/10 w-full rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="Enter username exactly as it appears..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
                />
                <Button
                  onClick={handleAddFriend}
                  disabled={isSearching}
                  className="bg-primary hover:bg-red-700 h-auto px-8 font-bold rounded-xl"
                >
                  {isSearching ? "Searching..." : "Send Request"}
                </Button>
              </div>
            </div>

            {/* Friends List */}
            <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-gray-400" /> My Friends
                <span className="ml-3 bg-zinc-800 text-gray-300 text-xs px-2 py-1 rounded-full">
                  {friends.length}
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {friends.map((friend) => (
                  <div
                    key={friend.user_id}
                    className="flex items-center justify-between p-4 bg-zinc-800/30 border border-white/5 rounded-xl hover:bg-zinc-800 transition-colors group"
                  >
                    <Link
                      to={`/user/${friend.user_id}`}
                      className="flex items-center gap-4"
                    >
                      <div className="h-12 w-12 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-gray-300 group-hover:bg-primary group-hover:text-white transition-all text-xl">
                        {friend.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-lg group-hover:text-primary transition-colors">
                          {friend.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          Friends since{" "}
                          {new Date(friend.friend_since).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                    <Link to={`/chat/${friend.user_id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white hover:bg-zinc-700"
                        title="Message"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
                {friends.length === 0 && (
                  <div className="col-span-full py-12 text-center border border-dashed border-gray-800 rounded-xl">
                    <p className="text-gray-500 italic mb-2">
                      You don't have any friends yet.
                    </p>
                    <p className="text-xs text-gray-600">
                      Use the search box above to connect with other movie
                      lovers!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Pending Requests */}
          <div className="space-y-8">
            <div className="bg-zinc-900/40 rounded-2xl p-6 border border-primary/20 shadow-lg">
              <h2 className="text-lg font-bold mb-6 text-white flex items-center justify-between">
                Pending Requests
                {requests.length > 0 && (
                  <span className="bg-primary text-white text-xs px-2.5 py-1 rounded-full animate-pulse">
                    {requests.length} new
                  </span>
                )}
              </h2>

              <div className="space-y-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-black/40 p-4 rounded-xl border border-primary/10 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-primary border border-primary/30">
                        {req.sender_username[0].toUpperCase()}
                      </div>
                      <span className="font-medium flex-grow">
                        {req.sender_username}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-primary hover:bg-red-700 h-9 text-sm font-bold shadow-[0_0_15px_rgba(229,9,20,0.3)]"
                        onClick={() => acceptRequest(req.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-700 hover:bg-gray-800 h-9 text-sm text-gray-400"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
                {requests.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-8">
                    No pending requests at the moment.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
