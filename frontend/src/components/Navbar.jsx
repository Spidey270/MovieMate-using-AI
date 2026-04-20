import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, api } from "../context/AuthContext";
import { Search, Bell, LogOut, X, Menu, Home, Film, Heart, Users, Sparkles, MessageCircle, Crown, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Profile Dropdown State
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await api.get("/notifications/");
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  }

  // Fetch Notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30s
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

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

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/movies", label: "Movies", icon: Film },
    ...(user
      ? [
          { to: "/wishlist", label: "My List", icon: Heart },
          { to: "/friends", label: "Friends", icon: Users },
          { to: "/recommendations", label: "For You", icon: Sparkles, highlight: true },
          { to: "/global-chat", label: "Global Chat", icon: MessageCircle, red: true },
          ...(user?.is_admin ? [{ to: "/admin/dashboard", label: "Admin", icon: Crown, admin: true }] : []),
        ]
      : []),
  ];

  return (
    <>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-zinc-950 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className="text-2xl font-bold text-primary"
              onClick={() => setSidebarOpen(false)}
            >
              MovieMate
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded p-1 hover:bg-zinc-800"
            >
              <ChevronLeft className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const baseClasses = "flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition";
              let activeClasses = "text-gray-300 hover:bg-zinc-800 hover:text-white";
              if (link.highlight) {
                activeClasses = "text-purple-400 hover:bg-purple-900/30 hover:text-purple-300";
              } else if (link.red) {
                activeClasses = "text-red-500 hover:bg-red-900/30 hover:text-red-400";
              } else if (link.admin) {
                activeClasses = "text-amber-400 hover:bg-amber-900/30 hover:text-amber-300";
              }

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`${baseClasses} ${activeClasses}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Navbar */}
      <nav className="fixed top-0 z-40 w-full bg-gradient-to-b from-black/80 to-transparent p-4 transition-all duration-300 hover:bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Left: Menu Button & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded p-2 hover:bg-white/10"
            >
              <Menu className="h-6 w-6 text-white" />
            </button>
            <Link to="/" className="text-2xl font-bold text-primary">
              MovieMate
            </Link>
          </div>

          {/* Right: Actions (unchanged) */}
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

                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center gap-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary font-bold text-white">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                  </button>

                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-48 rounded bg-black/90 p-2 shadow-xl ring-1 ring-white/20">
                      <div className="px-4 py-2 text-sm text-gray-300">
                        Logged in as{" "}
                        <span className="text-white">{user?.username}</span>
                      </div>
                      <hr className="my-1 border-gray-700" />
                      <Link
                        to="/profile"
                        className="flex w-full items-center gap-2 rounded px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                        onClick={() => setShowProfile(false)}
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowProfile(false);
                        }}
                        className="flex w-full items-center gap-2 rounded px-4 py-2 text-sm text-red-500 hover:bg-gray-800"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  )}
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
    </>
  );
}
