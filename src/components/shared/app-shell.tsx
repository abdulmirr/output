'use client';

import { GlobalHotkeys } from './global-hotkeys';
import { KeyboardShortcutsDialog } from './keyboard-shortcuts-dialog';
import { WorkBlockOverlay } from '@/components/work-block/work-block-overlay';
import { DurationDialog } from '@/components/tasks/duration-dialog';
import { NotesDialog } from '@/components/tasks/notes-dialog';
import { DateDialog } from '@/components/tasks/date-dialog';
import { useOverlayStore } from '@/stores/overlay-store';
import { useWorkBlockStore } from '@/stores/work-block-store';
import { StoreProvider } from '@/stores/store-provider';
import { ThemeApplier } from './theme-applier';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <ThemeApplier />
      <AppShellInner>{children}</AppShellInner>
    </StoreProvider>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { activeOverlay, close } = useOverlayStore();
  const workBlockPhase = useWorkBlockStore((s) => s.phase);
  const workBlockMinimized = useWorkBlockStore((s) => s.minimized);

  const workBlockVisible =
    activeOverlay === 'work-block' ||
    ((workBlockPhase === 'active' || workBlockPhase === 'rating') && !workBlockMinimized);

  return (
    <>
      <GlobalHotkeys />
      {children}
      <WorkBlockOverlay
        visible={workBlockVisible}
        onClose={close}
      />
      <KeyboardShortcutsDialog
        open={activeOverlay === 'keyboard-shortcuts'}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      />
      <DurationDialog />
      <NotesDialog />
      <DateDialog />
    </>
  );
}


