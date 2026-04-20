import { Suspense } from 'react';
import { getTasks, getTaskFolders } from '@/lib/api/queries';
import { TasksPageClient } from './page-client';

export const unstable_instant = {
  prefetch: 'static',
  unstable_disableBuildValidation: true,
};

async function TasksData() {
  const [tasks, folders] = await Promise.all([getTasks(), getTaskFolders()]);
  return <TasksPageClient initialTasks={tasks} initialFolders={folders} />;
}

export default function TasksPage() {
  return (
    <Suspense fallback={null}>
      <TasksData />
    </Suspense>
  );
}
