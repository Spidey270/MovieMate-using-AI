import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Search, MessageCircle, MoreVertical } from "lucide-react";

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // Get friends
        const friendsRes = await api.get("/friends/");
        const friends = friendsRes.data;
        
        // Get recent messages for each friend
        const convs = await Promise.all(
          friends.map(async (friend) => {
            try {
              const chatRes = await api.get(`/chat/${friend.user_id}`);
              const messages = chatRes.data;
              const lastMessage = messages[messages.length - 1];
              return {
                ...friend,
                lastMessage: lastMessage?.content || null,
                lastMessageTime: lastMessage?.timestamp || null,
                unreadCount: 0, // Could track unread in backend
              };
            } catch {
              return {
                ...friend,
                lastMessage: null,
                lastMessageTime: null,
                unreadCount: 0,
              };
            }
          })
        );
        
        // Sort by most recent
        convs.sort((a, b) => {
          if (!a.lastMessageTime) return 1;
          if (!b.lastMessageTime) return -1;
          return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        });
        
        setConversations(convs);
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchConversations();
  }, [user]);

  const filteredConversations = conversations.filter((conv) =>
    conv.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-secondary text-white pb-20">
      <Navbar />

      <div className="pt-24 mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Link
            to="/global-chat"
            className="flex items-center gap-2 text-primary hover:text-red-400 text-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Global Chat
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-full py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-primary"
          />
        </div>

        {/* Conversations List */}
        {filteredConversations.length > 0 ? (
          <div className="space-y-2">
            {filteredConversations.map((conv) => (
              <div
                key={conv.user_id}
                onClick={() => navigate(`/chat/${conv.user_id}`)}
                className="flex items-center gap-4 p-4 bg-zinc-900 rounded-xl hover:bg-zinc-800 cursor-pointer transition"
              >
                {/* Avatar */}
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {conv.username?.[0]?.toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">{conv.username}</h3>
                    {conv.lastMessageTime && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(conv.lastMessageTime).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {conv.lastMessage || "No messages yet"}
                  </p>
                </div>

                {/* Unread indicator */}
                {conv.unreadCount > 0 && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold">
                    {conv.unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No conversations yet</p>
            <p className="text-gray-600 text-sm">
              Add friends to start chatting!
            </p>
            <Link
              to="/friends"
              className="inline-block mt-4 text-primary hover:text-red-400 text-sm"
            >
              Find Friends →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}