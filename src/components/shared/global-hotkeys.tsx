'use client';

import { useHotkeys } from 'react-hotkeys-hook';
import { useOverlayStore } from '@/stores/overlay-store';
import { useWorkBlockStore } from '@/stores/work-block-store';
import { useTaskStore } from '@/stores/task-store';

export function GlobalHotkeys() {
  const { toggle, open, close, activeOverlay } = useOverlayStore();
  const workBlockPhase = useWorkBlockStore((s) => s.phase);
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId);

  useHotkeys(
    'meta+shift+o',
    (e) => {
      e.preventDefault();
      if (workBlockPhase === 'active' || workBlockPhase === 'rating') {
        useWorkBlockStore.getState().restore();
        open('work-block');
      } else {
        toggle('work-block');
        if (workBlockPhase === 'idle') {
          useWorkBlockStore.getState().beginStart();
        }
      }
    },
    { enableOnFormTags: false }
  );

  useHotkeys(
    'meta+shift+n',
    (e) => {
      e.preventDefault();
      toggle('task-creation');
    },
    { enableOnFormTags: false }
  );

  useHotkeys(
    'meta+/',
    (e) => {
      e.preventDefault();
      toggle('keyboard-shortcuts');
    },
    { enableOnFormTags: true }
  );

  useHotkeys(
    'd',
    (e) => {
      if (selectedTaskId) {
         e.preventDefault();
         open('duration-dialog');
      }
    },
    { enableOnFormTags: false }
  );

  useHotkeys(
    'n',
    (e) => {
      if (selectedTaskId) {
         e.preventDefault();
         open('notes-dialog');
      }
    },
    { enableOnFormTags: false }
  );

  useHotkeys(
    'escape',
    (e) => {
      e.preventDefault();
      if (workBlockPhase === 'active') {
        useWorkBlockStore.getState().minimize();
        close();
      } else if (activeOverlay) {
        close();
      }
    },
    { enableOnFormTags: true }
  );

  return null;
}
