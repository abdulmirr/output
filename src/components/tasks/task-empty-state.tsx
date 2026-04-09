import { Inbox } from 'lucide-react';

interface TaskEmptyStateProps {
  folderName: string;
}

export function TaskEmptyState({ folderName }: TaskEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground/50 mb-3" />
      <p className="text-sm font-medium">No tasks in {folderName}</p>
      <p className="text-xs text-muted-foreground mt-1">
        Press{' '}
        <kbd className="px-1 py-0.5 text-xs bg-muted rounded font-mono">
          Cmd+Shift+N
        </kbd>{' '}
        to add a task
      </p>
    </div>
  );
}
