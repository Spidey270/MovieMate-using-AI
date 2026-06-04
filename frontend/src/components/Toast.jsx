import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: AlertCircle,
  warning: AlertCircle,
};

const colorMap = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
};

export default function Toast({ id, type = "info", message, duration = 5000, onClose }) {
  const Icon = iconMap[type] || AlertCircle;
  const colorClass = colorMap[type] || colorMap.info;

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  return (
    <div
      className={`${colorClass} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slideIn`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="flex-grow text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-white/80 hover:text-white transition flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
