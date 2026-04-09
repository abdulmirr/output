'use client';

import { Separator } from '@/components/ui/separator';
import { useThemeStore } from '@/stores/theme-store';
import { cn } from '@/lib/utils';

export function SettingsForm() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Appearance</h3>
        <div className="flex gap-3">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                'flex-1 rounded-lg border p-3 text-sm font-medium text-center transition-colors capitalize',
                theme === t
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:bg-muted'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Keyboard Shortcuts Reference */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Keyboard Shortcuts</h3>
        <div className="space-y-2">
          {[
            { keys: 'Cmd+Shift+O', description: 'Start / show work block' },
            { keys: 'Cmd+Shift+N', description: 'Add a new task' },
            { keys: 'Cmd+/', description: 'Show all shortcuts' },
            { keys: 'Esc', description: 'Close overlay / minimize' },
            { keys: 'Enter', description: 'Submit / start' },
          ].map((shortcut) => (
            <div
              key={shortcut.keys}
              className="flex items-center justify-between py-1"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <kbd className="px-2 py-1 text-xs bg-muted rounded font-mono">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Preferences */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Preferences</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>More settings coming soon: notifications, data export, and more.</p>
        </div>
      </div>
    </div>
  );
}
