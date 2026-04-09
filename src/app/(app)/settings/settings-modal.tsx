'use client';

import { useState, useRef, useTransition, useEffect, useCallback } from 'react';
import { X, User, Sun, Keyboard, Camera } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/theme-store';
import { updateProfile } from './actions';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/lib/types';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

type Section = 'profile' | 'appearance' | 'shortcuts';

const shortcuts = [
  { keys: ['Cmd', 'Shift', 'O'], description: 'Start / show work block' },
  { keys: ['Cmd', 'Shift', 'N'], description: 'Add a new task' },
  { keys: ['Cmd', '/'], description: 'Show keyboard shortcuts' },
  { keys: ['Esc'], description: 'Close overlay / minimize' },
  { keys: ['Enter'], description: 'Submit / confirm' },
];

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useThemeStore();
  const [section, setSection] = useState<Section>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const meta = user.user_metadata;
    const googleAvatar = meta?.avatar_url || meta?.picture || null;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      const p: UserProfile = {
        id: data.id,
        email: user.email ?? '',
        displayName: data.display_name ?? null,
        avatarUrl: data.avatar_url ?? googleAvatar,
        theme: data.theme ?? 'system',
        createdAt: new Date(data.created_at),
        role: data.role ?? null,
        dailyGoalHours: data.daily_goal_hours ?? 4,
        onboardingCompleted: data.onboarding_completed ?? false,
        hasCompletedFirstBlock: data.has_completed_first_block ?? false,
        onboardingChecklistDismissed: data.onboarding_checklist_dismissed ?? false,
      };
      setProfile(p);
      setDisplayName(p.displayName ?? '');
      setAvatarUrl(p.avatarUrl ?? googleAvatar);
    } else {
      setProfile({
        id: user.id,
        email: user.email ?? '',
        displayName: null,
        avatarUrl: googleAvatar,
        theme: 'system',
        createdAt: new Date(),
        role: null,
        dailyGoalHours: 4,
        onboardingCompleted: false,
        hasCompletedFirstBlock: false,
        onboardingChecklistDismissed: false,
      });
      setAvatarUrl(googleAvatar);
    }
  }, []);

  useEffect(() => {
    if (open) fetchProfile();
  }, [open, fetchProfile]);

  const initials = (profile?.displayName || profile?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleNameBlur = () => {
    if (displayName.trim() && displayName.trim() !== profile?.displayName) {
      startTransition(() => {
        updateProfile({ displayName: displayName.trim() });
      });
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ext = file.name.split('.').pop();
      const path = `${user.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
        setAvatarUrl(publicUrl);
        startTransition(() => {
          updateProfile({ avatarUrl: publicUrl });
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const navSections = [
    {
      label: 'Account',
      items: [{ id: 'profile' as Section, icon: User, label: 'Profile' }],
    },
    {
      label: 'Preferences',
      items: [
        { id: 'appearance' as Section, icon: Sun, label: 'Appearance' },
        { id: 'shortcuts' as Section, icon: Keyboard, label: 'Shortcuts' },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-3xl sm:max-w-3xl h-[78vh] p-0 gap-0 flex overflow-hidden"
      >
        {/* Left nav */}
        <div className="w-52 shrink-0 border-r border-border flex flex-col p-3 bg-muted/30">
          {navSections.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-2 mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group.label}
              </p>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left',
                    section === item.id
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Right content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-border shrink-0">
            <h2 className="text-[18px] font-semibold tracking-[-0.02em]">
              {section === 'profile' ? 'Profile' : section === 'appearance' ? 'Appearance' : 'Shortcuts'}
            </h2>
            {section === 'profile' && (
              <p className="text-sm text-muted-foreground mt-0.5">
                Signed in as {profile?.email}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {section === 'profile' && (
              <div className="space-y-0 divide-y divide-border">
                {/* Avatar row */}
                <div className="flex items-center justify-between py-5 first:pt-0">
                  <span className="text-sm font-medium">Profile picture</span>
                  <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <Avatar className="h-16 w-16">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile" />}
                      <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      'absolute inset-0 rounded-full bg-black/50 flex items-center justify-center transition-opacity',
                      uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )}>
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                </div>

                {/* Display name row */}
                <div className="flex items-center justify-between py-5">
                  <span className="text-sm font-medium">Full name</span>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onBlur={handleNameBlur}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                    placeholder="Your name"
                    className="w-56 h-9"
                  />
                </div>

                {/* Email row */}
                <div className="flex items-center justify-between py-5">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-sm text-muted-foreground">{profile?.email}</span>
                </div>
              </div>
            )}

            {section === 'appearance' && (
              <div className="space-y-0 divide-y divide-border">
                <div className="flex items-center justify-between py-5 first:pt-0">
                  <div>
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose your preferred color scheme</p>
                  </div>
                  <div className="flex gap-2">
                    {(['light', 'dark', 'system'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={cn(
                          'px-4 py-1.5 rounded-md text-sm font-medium border transition-colors capitalize',
                          theme === t
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-muted text-muted-foreground'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {section === 'shortcuts' && (
              <div className="space-y-0 divide-y divide-border">
                {shortcuts.map((shortcut) => (
                  <div key={shortcut.description} className="flex items-center justify-between py-4 first:pt-0">
                    <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key) => (
                        <kbd key={key} className="px-2 py-1 text-xs bg-muted rounded font-mono border border-border">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
