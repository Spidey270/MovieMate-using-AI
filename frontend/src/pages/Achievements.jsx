import { useEffect, useState } from "react";
import { api } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import AchievementBadge from "../components/AchievementBadge";
import { useToast } from "../context/ToastContext";
import { Trophy } from "lucide-react";

export default function Achievements() {
  const [allAchievements, setAllAchievements] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [achievementsRes, progressRes] = await Promise.all([
        api.get("/achievements/"),
        api.get("/achievements/my"),
      ]);

      setAllAchievements(achievementsRes.data);
      setUserProgress(progressRes.data);
    } catch (error) {
      addToast("Failed to load achievements", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const unlockedIds = new Set(
    userProgress?.unlocked?.map((a) => a.id) || []
  );

  return (
    <div className="min-h-screen bg-secondary text-white pb-20">
      <Navbar />

      <div className="pt-24 mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="h-10 w-10 text-yellow-400" />
          <h1 className="text-4xl font-bold">Achievements</h1>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6 mb-8 border border-white/5">
          <div className="text-center">
            <p className="text-4xl font-bold mb-2">
              {userProgress?.total_unlocked || 0} / {userProgress?.total_available || 0}
            </p>
            <p className="text-gray-400">Achievements Unlocked</p>
            <div className="mt-4 h-3 bg-zinc-800 rounded-full overflow-hidden max-w-md mx-auto">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                style={{
                  width: `${
                    ((userProgress?.total_unlocked || 0) /
                      (userProgress?.total_available || 1)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Unlocked</h2>
            {userProgress?.unlocked?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userProgress.unlocked.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    unlocked={true}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400">
                No achievements unlocked yet. Start watching movies to unlock them!
              </p>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Locked</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allAchievements
                .filter((a) => !unlockedIds.has(a.id))
                .map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    progress={userProgress?.progress?.[achievement.id]}
                    unlocked={false}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
