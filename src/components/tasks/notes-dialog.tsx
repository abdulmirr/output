'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { Portal } from '@/components/shared/portal';
import { useOverlayStore } from '@/stores/overlay-store';
import { useTaskStore } from '@/stores/task-store';
import { updateTask } from '@/app/(app)/tasks/actions';

export function NotesDialog() {
  const { activeOverlay, close } = useOverlayStore();
  const { selectedTaskId, tasks, updateTaskOptimistic } = useTaskStore();
  const visible = activeOverlay === 'notes-dialog';
  
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const [notes, setNotes] = useState(selectedTask?.notes || '');
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (visible && selectedTask) {
      setNotes(selectedTask.notes || '');
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(textareaRef.current?.value.length || 0, textareaRef.current?.value.length || 0);
      }, 50);
    }
  }, [visible, selectedTask]);

  if (!visible || !selectedTask) return null;

  const handleSave = () => {
    updateTaskOptimistic(selectedTask.id, { notes: notes.trim() || null });
    
    startTransition(async () => {
      await updateTask(selectedTask.id, { notes: notes.trim() || null });
    });
    
    close();
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
        <div className="fixed inset-0 bg-black/40" onClick={close} />
        <div className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-xl">
          <div className="space-y-4">
            <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Notes for task</h2>
            <textarea
              ref={textareaRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add some notes here..."
              className="w-full min-h-[120px] resize-none bg-transparent outline-none text-sm p-3 border border-input rounded-md focus:border-ring transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  close();
                }
              }}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Cmd+Enter to save</span>
              <button 
                onClick={handleSave}
                disabled={isPending}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
