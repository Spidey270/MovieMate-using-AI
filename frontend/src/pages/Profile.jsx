import { useEffect, useState } from "react";
import { api, useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PreferencesModal from "../components/PreferencesModal";
import { Settings } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);

  const handlePrefsSaved = async () => {
    try {
      await api.get("/auth/me");
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-secondary text-white pb-20">
      <Navbar />

      <div className="pt-24 mx-auto max-w-4xl px-4">
        {/* Header Profile Section */}
        <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl border border-white/5">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center text-5xl font-bold shadow-2xl border-4 border-zinc-800">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{user?.username}</h1>
              <p className="text-gray-400 mb-6">{user?.email}</p>
              <Button
                onClick={() => setShowPrefs(true)}
                variant="outline"
                className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 h-10 px-6"
              >
                <Settings className="mr-2 h-4 w-4" /> Edit Preferences
              </Button>
            </div>
          </div>

          {/* User Stats / Info could go here */}
          <div className="mt-8 pt-8 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Favorite Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {user?.favorite_genres?.length > 0 ? (
                  user.favorite_genres.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 bg-zinc-800 rounded-full text-xs text-gray-300"
                    >
                      {g}
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
                {user?.favorite_languages?.length > 0 ? (
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

      <PreferencesModal
        isOpen={showPrefs}
        onClose={() => setShowPrefs(false)}
        onSave={handlePrefsSaved}
      />
    </div>
  );
}
