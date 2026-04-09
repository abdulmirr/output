import { getAllBlocks, getAllDailyLogs, getAllDailyTodos } from '@/lib/api/queries';
import { ArchivePageClient } from './page-client';

export default async function ArchivePage() {
  const [blocks, logs, todos] = await Promise.all([
    getAllBlocks(),
    getAllDailyLogs(),
    getAllDailyTodos(),
  ]);

  return <ArchivePageClient initialBlocks={blocks} initialLogs={logs} initialTodos={todos} />;
}
