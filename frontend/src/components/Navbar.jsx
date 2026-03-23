import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, api } from "../context/AuthContext";
import { Search, Bell, LogOut, X } from "lucide-react";
import { Button } from "./ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Search State
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  // Notification State
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30s
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  async function fetchNotifications() {
    try {
      const res = await api.get("/notifications/");
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark read");
    }
  };

  // Handle Search
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        // Backend doesn't have text search, so we fetch all and filter client side
        // OR ideally we add ?search= param to backend.
        // For now, I'll filter client-side if I can fetch all,
        // or just mock it by fetching /movies and filtering locally since dataset is small.
        const res = await api.get("/movies");
        // Simple case-insensitive match
        const results = res.data.filter((m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setSearchResults(results.slice(0, 5));
      } catch (error) {
        console.error("Search failed");
      }
    };

    // Debounce
    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <nav className="fixed top-0 z-50 w-full bg-gradient-to-b from-black/80 to-transparent p-4 transition-all duration-300 hover:bg-black">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Left: Logo & Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-primary">
            MovieMate
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-300 hover:text-white font-medium transition"
            >
              Home
            </Link>
            <Link
              to="/movies"
              className="text-gray-300 hover:text-white font-medium transition"
            >
              Movies
            </Link>
            {user && (
              <>
                <Link
                  to="/wishlist"
                  className="text-gray-300 hover:text-white font-medium transition"
                >
                  My List
                </Link>
                <Link
                  to="/friends"
                  className="text-gray-300 hover:text-white font-medium transition"
                >
                  Friends
                </Link>
                <Link
                  to="/global-chat"
                  className="text-red-500 font-black tracking-widest hover:text-red-400 transition"
                  style={{ textShadow: "0 0 10px rgba(239,68,68,0.5)" }}
                >
                  GLOBAL CHAT
                </Link>
                {user?.is_admin && (
                  <Link
                    to="/admin/dashboard"
                    className="text-amber-400 font-bold tracking-wide hover:text-amber-300 transition"
                    style={{ textShadow: "0 0 8px rgba(251, 191, 36, 0.5)" }}
                  >
                    ADMIN
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          {/* SEARCH */}
          <div ref={searchRef} className="relative">
            {showSearch ? (
              <div className="flex items-center border border-white bg-black/80 px-2 py-1 transition-all">
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  autoFocus
                  className="bg-transparent text-sm text-white focus:outline-none w-48"
                  placeholder="Titles, people, genres"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <X
                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-white"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery("");
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="text-white hover:text-gray-300"
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            {/* Search Results Dropdown */}
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-900 shadow-xl rounded overflow-hidden">
                {searchResults.map((movie) => (
                  <Link
                    key={movie.id}
                    to={`/movie/${movie.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-zinc-800 transition"
                    onClick={() => setShowSearch(false)}
                  >
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                          : "https://via.placeholder.com/50"
                      }
                      className="w-10 h-14 object-cover rounded"
                      alt={movie.title}
                    />
                    <div className="text-sm text-white">
                      <div className="font-bold">{movie.title}</div>
                      <div className="text-xs text-gray-400">
                        {movie.release_date?.substring(0, 4)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* USER PROFILE / LOGIN */}
          {user ? (
            <>
              {/* NOTIFICATIONS */}
              <div ref={notifRef} className="relative">
                <button
                  className="relative text-white hover:text-gray-300"
                  onClick={() => setShowNotifs(!showNotifs)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 rounded bg-black/95 p-2 shadow-2xl ring-1 ring-white/20 max-h-96 overflow-y-auto">
                    <div className="p-2 border-b border-gray-800 font-bold mb-2">
                      Notifications
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 border-b border-gray-800 text-sm hover:bg-gray-900 cursor-pointer transition ${n.is_read ? "opacity-50" : "opacity-100"}`}
                          onClick={() => {
                            markAsRead(n.id);
                            if (n.link) {
                              navigate(n.link);
                              setShowNotifs(false);
                            }
                          }}
                        >
                          <p className="text-gray-200">{n.message}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(n.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="group relative">
                <Link to="/profile">
                  <button className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary font-bold text-white">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                  </button>
                </Link>

                <div className="absolute right-0 mt-2 hidden w-48 rounded bg-black/90 p-2 shadow-xl ring-1 ring-white/20 group-hover:block">
                  <div className="px-4 py-2 text-sm text-gray-300">
                    Logged in as{" "}
                    <span className="text-white">{user?.username}</span>
                  </div>
                  <hr className="my-1 border-gray-700" />
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded px-4 py-2 text-sm text-red-500 hover:bg-gray-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="text-white hover:text-gray-300"
                >
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-primary hover:bg-red-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
