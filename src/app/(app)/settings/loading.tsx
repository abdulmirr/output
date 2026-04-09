export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Profile section skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 bg-muted rounded-full" />
        <div className="space-y-2">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
      </div>

      {/* Form skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded-md" />
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded-md" />
      </div>
    </div>
  );
}
