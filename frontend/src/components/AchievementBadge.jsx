export default function AchievementBadge({ achievement, progress, unlocked }) {
  return (
    <div
      className={`bg-zinc-900 rounded-xl p-6 border ${
        unlocked ? "border-yellow-500/50" : "border-white/5"
      } transition hover:border-primary/50`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`text-5xl ${
            unlocked ? "grayscale-0" : "grayscale opacity-50"
          }`}
        >
          {achievement.icon}
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-lg mb-1">{achievement.name}</h3>
          <p className="text-gray-400 text-sm mb-3">{achievement.description}</p>

          {!unlocked && progress && (
            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="font-medium">
                  {progress.current} / {progress.required}
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {unlocked && (
            <div className="flex items-center gap-2 text-green-500">
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">Unlocked!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
