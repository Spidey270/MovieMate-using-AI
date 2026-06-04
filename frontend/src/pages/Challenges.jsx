import { useEffect, useState } from "react";
import { api } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import { Trophy, CheckCircle, Circle } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await api.get("/challenges/");
      setChallenges(response.data);
    } catch (error) {
      addToast("Failed to load challenges", "error");
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (challengeId) => {
    try {
      const response = await api.post(`/challenges/${challengeId}/claim`);
      if (response.data.error) {
        addToast(response.data.error, "error");
      } else {
        addToast(`Claimed ${response.data.xp_awarded} XP!`, "success");
        fetchChallenges();
      }
    } catch (error) {
      addToast("Failed to claim reward", "error");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-secondary text-white pb-20">
      <Navbar />

      <div className="pt-24 mx-auto max-w-4xl px-4">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="h-10 w-10 text-yellow-400" />
          <h1 className="text-4xl font-bold">Monthly Challenges</h1>
        </div>

        <p className="text-gray-400 mb-8">
          Complete challenges to earn XP and level up your profile!
        </p>

        <div className="space-y-4">
          {challenges.map((challenge) => {
            const progress = challenge.progress;
            const isComplete = progress.completed;

            return (
              <div
                key={challenge.id}
                className={`bg-zinc-900 rounded-xl p-6 border ${
                  isComplete ? "border-green-500/50" : "border-white/5"
                } transition`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{challenge.icon}</div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">{challenge.title}</h3>
                      {isComplete ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <p className="text-gray-400 mb-4">{challenge.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-medium">
                          {progress.current} / {progress.target}
                        </span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isComplete ? "bg-green-500" : "bg-primary"
                          }`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-yellow-400">
                        Reward: {challenge.reward_xp} XP
                      </span>
                      {isComplete && (
                        <Button
                          onClick={() => claimReward(challenge.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Claim Reward
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
