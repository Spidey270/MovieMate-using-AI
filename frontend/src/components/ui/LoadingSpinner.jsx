export default function LoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-secondary">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-primary"></div>
    </div>
  );
}
