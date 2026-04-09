export default function OutputLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Date header skeleton */}
      <div className="h-8 w-64 bg-muted rounded-md" />

      {/* Daily todos skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-6 w-full bg-muted rounded" />
        <div className="h-6 w-5/6 bg-muted rounded" />
        <div className="h-6 w-4/6 bg-muted rounded" />
      </div>

      {/* Work blocks skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-16 w-full bg-muted rounded-lg" />
        <div className="h-16 w-full bg-muted rounded-lg" />
      </div>

      {/* Thoughts skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-28 bg-muted rounded" />
        <div className="h-24 w-full bg-muted rounded-lg" />
      </div>
    </div>
  );
}
