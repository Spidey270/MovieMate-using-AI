import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Bell, Check, CheckCheck, Trash2, Film, Users, MessageCircle, Star } from "lucide-react";

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications/");
        setNotifications(res.data);
      } catch (error) {
        console.error("Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (error) {
      console.error("Failed to mark read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (message) => {
    const lower = message.toLowerCase();
    if (lower.includes("review")) return <Star className="h-4 w-4 text-amber-400" />;
    if (lower.includes("friend")) return <Users className="h-4 w-4 text-blue-400" />;
    if (lower.includes("message")) return <MessageCircle className="h-4 w-4 text-green-400" />;
    return <Film className="h-4 w-4 text-primary" />;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-secondary text-white pb-20">
      <Navbar />

      <div className="pt-24 mx-auto max-w-2xl px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-xs px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm text-primary hover:text-red-400 transition"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 rounded-xl transition ${
                  n.is_read
                    ? "bg-zinc-900/50 opacity-60"
                    : "bg-zinc-900 border-l-4 border-primary"
                }`}
              >
                <div className="mt-1">{getNotificationIcon(n.message)}</div>
                <div
                  className="flex-grow cursor-pointer"
                  onClick={() => {
                    markAsRead(n.id);
                    if (n.link) {
                      navigate(n.link);
                    }
                  }}
                >
                  <p className="text-sm">{n.message}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="text-gray-500 hover:text-red-500 transition p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}