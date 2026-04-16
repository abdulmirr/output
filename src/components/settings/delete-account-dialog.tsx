'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { deleteAccount } from '@/app/(app)/settings/actions';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}

export function DeleteAccountDialog({ open, onOpenChange, email }: DeleteAccountDialogProps) {
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canDelete = confirm.trim().toLowerCase() === email.toLowerCase();

  const handleDelete = () => {
    if (!canDelete) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteAccount();
      if (res && 'error' in res && res.error) {
        setError(res.error);
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setConfirm('');
          setError(null);
        }
        onOpenChange(o);
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-md p-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <DialogTitle className="text-lg font-light tracking-tight">
              Delete account
            </DialogTitle>
            <DialogDescription className="text-sm font-light text-foreground/60">
              This permanently removes your profile, work blocks, tasks, daily logs, and
              everything else. This cannot be undone.
            </DialogDescription>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-light text-foreground/40">
              Type your email to confirm
            </label>
            <input
              type="email"
              autoComplete="off"
              autoCapitalize="off"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={email}
              className="w-full bg-transparent border-b border-border/40 focus:border-foreground py-1.5 text-base font-light focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs font-light text-destructive">{error}</p>
          )}

          <div className="flex items-center justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-sm font-light text-foreground/60 hover:text-foreground transition-colors"
              disabled={pending}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!canDelete || pending}
              className="text-sm font-light text-destructive hover:underline underline-offset-4 disabled:text-foreground/20 disabled:no-underline disabled:cursor-not-allowed transition-colors"
            >
              {pending ? 'Deleting\u2026' : 'Delete account'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
