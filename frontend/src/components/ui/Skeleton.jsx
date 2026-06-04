export default function Skeleton({ className = "", variant = "default" }) {
  const baseClasses = "animate-pulse bg-zinc-800 rounded";

  const variants = {
    default: "h-4 w-full",
    text: "h-4 w-3/4",
    title: "h-8 w-1/2",
    circle: "h-12 w-12 rounded-full",
    card: "h-64 w-full",
    avatar: "h-10 w-10 rounded-full",
  };

  return (
    <div className={`${baseClasses} ${variants[variant] || variants.default} ${className}`} />
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden">
      <Skeleton className="h-72 w-full rounded-t-lg rounded-b-none" />
      <div className="p-4 space-y-3">
        <Skeleton variant="title" />
        <Skeleton variant="text" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" className="h-24 w-24" />
        <div className="space-y-2 flex-grow">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  );
}
