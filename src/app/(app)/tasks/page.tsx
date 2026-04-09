import { getTasks, getTaskFolders } from '@/lib/api/queries';
import { TasksPageClient } from './page-client';

export default async function TasksPage() {
  const [tasks, folders] = await Promise.all([getTasks(), getTaskFolders()]);

  return <TasksPageClient initialTasks={tasks} initialFolders={folders} />;
}
