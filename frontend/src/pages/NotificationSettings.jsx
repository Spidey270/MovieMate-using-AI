import { useEffect, useState } from "react";
import { api, useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import { Bell, Save } from "lucide-react";
import { Button } from "../components/ui/button";

export default function NotificationSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    friend_requests: true,
    new_reviews: true,
    mentions: true,
    recommendations: true,
    achievements: true,
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (user?.notification_preferences) {
      setPreferences(user.notification_preferences);
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put("/auth/notification-preferences", preferences);
      addToast("Notification preferences saved", "success");
    } catch (error) {
      addToast("Failed to save preferences", "error");
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (key) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  return (
    <div className="min-h-screen bg-secondary text-white pb-20">
      <Navbar />

      <div className="pt-24 mx-auto max-w-2xl px-4">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold">Notification Settings</h1>
        </div>

        <div className="bg-zinc-900 rounded-xl p-8 border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Friend Requests</h3>
              <p className="text-gray-400 text-sm">
                Get notified when someone sends you a friend request
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.friend_requests}
                onChange={() => togglePreference("friend_requests")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">New Reviews</h3>
              <p className="text-gray-400 text-sm">
                Get notified when friends review movies
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.new_reviews}
                onChange={() => togglePreference("new_reviews")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Mentions</h3>
              <p className="text-gray-400 text-sm">
                Get notified when someone mentions you
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.mentions}
                onChange={() => togglePreference("mentions")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Recommendations</h3>
              <p className="text-gray-400 text-sm">
                Get movie recommendations from AI
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.recommendations}
                onChange={() => togglePreference("recommendations")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Achievements</h3>
              <p className="text-gray-400 text-sm">
                Get notified when you unlock achievements
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.achievements}
                onChange={() => togglePreference("achievements")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-primary hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
