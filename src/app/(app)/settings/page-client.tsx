'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Camera, ChevronDown, Minus, Plus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/theme-store';
import { createClient } from '@/lib/supabase/client';
import { updateProfile, signOut } from './actions';
import { DeleteAccountDialog } from '@/components/settings/delete-account-dialog';
import type { UserProfile, UserRole } from '@/lib/types';

interface SettingsPageClientProps {
  profile: UserProfile;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'founder', label: 'Founder' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'student', label: 'Student' },
  { value: 'creator', label: 'Creator' },
  { value: 'other', label: 'Other' },
];

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ['\u2318', '\u21e7', 'O'], description: 'Start or show work block' },
  { keys: ['\u2318', '\u21e7', 'N'], description: 'Add a new task' },
  { keys: ['\u2318', '/'], description: 'Show keyboard shortcuts' },
  { keys: ['Esc'], description: 'Close overlay / minimize' },
  { keys: ['\u23ce'], description: 'Submit or confirm' },
];

function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function getAllTimezones(): string[] {
  try {
    const fn = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] })
      .supportedValuesOf;
    if (typeof fn === 'function') return fn('timeZone');
  } catch {
    /* noop */
  }
  return [
    'UTC',
    'America/Los_Angeles',
    'America/Denver',
    'America/Chicago',
    'America/New_York',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Istanbul',
    'Africa/Johannesburg',
    'Asia/Dubai',
    'Asia/Karachi',
    'Asia/Kolkata',
    'Asia/Bangkok',
    'Asia/Singapore',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];
}

function formatZoneNow(tz: string): string {
  try {
    const time = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date());
    const offset = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value;
    return offset ? `${time} \u00b7 ${offset}` : time;
  } catch {
    return '';
  }
}

export function SettingsPageClient({ profile }: SettingsPageClientProps) {
  const { theme, setTheme } = useThemeStore();

  const [displayName, setDisplayName] = useState(profile.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl);
  const [role, setRole] = useState<UserRole | null>(profile.role);
  const [goalHours, setGoalHours] = useState<number>(profile.dailyGoalHours);
  const [timezone, setTimezone] = useState<string>(
    profile.timezone || getBrowserTimezone()
  );

  const [uploading, setUploading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const timezones = useMemo(() => getAllTimezones(), []);
  const [zoneNow, setZoneNow] = useState(() => formatZoneNow(timezone));
  useEffect(() => {
    setZoneNow(formatZoneNow(timezone));
    const id = setInterval(() => setZoneNow(formatZoneNow(timezone)), 30_000);
    return () => clearInterval(id);
  }, [timezone]);

  const initials = (profile.displayName || profile.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleNameBlur = () => {
    const next = displayName.trim();
    if (!next || next === profile.displayName) return;
    startTransition(() => {
      updateProfile({ displayName: next });
    });
  };

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const ext = file.name.split('.').pop();
        const path = `${user.id}.${ext}`;
        const { error } = await supabase.storage
          .from('avatars')
          .upload(path, file, { upsert: true });
        if (error) return;
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(path);
        const bust = `${publicUrl}?t=${Date.now()}`;
        setAvatarUrl(bust);
        startTransition(() => {
          updateProfile({ avatarUrl: publicUrl });
        });
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const updateGoal = (next: number) => {
    const clamped = Math.max(1, Math.min(8, next));
    if (clamped === goalHours) return;
    setGoalHours(clamped);
    startTransition(() => {
      updateProfile({ dailyGoalHours: clamped });
    });
  };

  const handleRoleChange = (next: UserRole) => {
    setRole(next);
    startTransition(() => {
      updateProfile({ role: next });
    });
  };

  const handleTimezoneChange = (next: string) => {
    setTimezone(next);
    startTransition(() => {
      updateProfile({ timezone: next });
    });
  };

  const handleTheme = (t: 'light-grid' | 'dark-grid' | 'light' | 'dark') => {
    setTheme(t);
    startTransition(() => {
      updateProfile({ theme: t });
    });
  };

  const handleSignOut = () => {
    startTransition(() => {
      signOut();
    });
  };

  return (
    <div className="space-y-12 md:space-y-16">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight">Settings</h1>
        <p className="text-sm font-light text-foreground/40">
          Signed in as {profile.email}
        </p>
      </header>

      <div className="h-px bg-foreground/[0.06]" />

      {/* PROFILE */}
      <section className="space-y-6">
        <h2 className="text-sm font-normal uppercase tracking-wider text-foreground/70">
          Profile
        </h2>

        <Row label="Profile picture">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
            aria-label="Change profile picture"
          >
            <Avatar size="lg" className="size-14">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile" />}
              <AvatarFallback className="text-base font-light">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                'absolute inset-0 rounded-full bg-black/40 flex items-center justify-center transition-opacity',
                uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              )}
            >
              <Camera className="h-4 w-4 text-white" />
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </button>
        </Row>

        <Row label="Display name">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            placeholder="Your name"
            className="w-56 text-right bg-transparent border-b border-border/40 focus:border-foreground py-1 text-base font-light focus:outline-none transition-colors placeholder:text-foreground/30"
          />
        </Row>

        <Row label="Email">
          <span className="text-base font-light text-foreground/60">
            {profile.email}
          </span>
        </Row>
      </section>

      <div className="h-px bg-foreground/[0.06]" />

      {/* FOCUS */}
      <section className="space-y-6">
        <h2 className="text-sm font-normal uppercase tracking-wider text-foreground/70">
          Focus
        </h2>

        <Row
          label="Daily focus goal"
          caption="How many hours of deep work you aim for each day."
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateGoal(goalHours - 1)}
              disabled={goalHours <= 1}
              className="size-7 rounded-full ring-1 ring-foreground/10 flex items-center justify-center text-foreground/60 hover:bg-foreground/[0.04] hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label="Decrease goal"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="font-mono text-base font-light tabular-nums min-w-[2.5rem] text-center">
              {goalHours}h
            </span>
            <button
              type="button"
              onClick={() => updateGoal(goalHours + 1)}
              disabled={goalHours >= 8}
              className="size-7 rounded-full ring-1 ring-foreground/10 flex items-center justify-center text-foreground/60 hover:bg-foreground/[0.04] hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              aria-label="Increase goal"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </Row>

        <Row label="Role" caption="Used to tailor copy and defaults.">
          <SelectChip
            value={role ?? ''}
            onChange={(v) => handleRoleChange(v as UserRole)}
            placeholder="Select role"
            options={ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))}
          />
        </Row>
      </section>

      <div className="h-px bg-foreground/[0.06]" />

      {/* TIME */}
      <section className="space-y-6">
        <h2 className="text-sm font-normal uppercase tracking-wider text-foreground/70">
          Time
        </h2>

        <Row
          label="Timezone"
          caption={zoneNow ? `Currently ${zoneNow}` : 'Used for day boundaries in your log.'}
        >
          <SelectChip
            value={timezone}
            onChange={handleTimezoneChange}
            options={timezones.map((tz) => ({ value: tz, label: tz.replace(/_/g, ' ') }))}
            className="max-w-[260px]"
          />
        </Row>
      </section>

      <div className="h-px bg-foreground/[0.06]" />

      {/* APPEARANCE */}
      <section className="space-y-6">
        <h2 className="text-sm font-normal uppercase tracking-wider text-foreground/70">
          Appearance
        </h2>

        <Row label="Theme" caption="Choose how Output looks.">
          <div className="flex items-center gap-1.5">
            {([
              { value: 'light-grid' as const, label: 'Light Grid' },
              { value: 'dark-grid' as const, label: 'Dark Grid' },
              { value: 'light' as const, label: 'Light' },
              { value: 'dark' as const, label: 'Dark' },
            ]).map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => handleTheme(t.value)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs transition-colors ring-1',
                  theme === t.value
                    ? 'ring-foreground/30 bg-foreground/[0.04] font-normal text-foreground'
                    : 'ring-foreground/10 font-light text-foreground/60 hover:bg-foreground/[0.04] hover:text-foreground'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Row>
      </section>

      <div className="h-px bg-foreground/[0.06]" />

      {/* SHORTCUTS */}
      <section className="space-y-6">
        <h2 className="text-sm font-normal uppercase tracking-wider text-foreground/70">
          Shortcuts
        </h2>

        <div className="space-y-0">
          {SHORTCUTS.map((s, i) => (
            <div
              key={s.description}
              className={cn(
                'flex items-center justify-between py-3',
                i !== 0 && 'border-t border-foreground/[0.06]'
              )}
            >
              <span className="text-base font-light text-foreground/70">
                {s.description}
              </span>
              <div className="flex items-center gap-1">
                {s.keys.map((key) => (
                  <kbd
                    key={key}
                    className="px-1.5 py-0.5 text-[11px] font-mono text-foreground/60"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-foreground/[0.06]" />

      {/* ACCOUNT */}
      <section className="space-y-6">
        <h2 className="text-sm font-normal uppercase tracking-wider text-foreground/70">
          Account
        </h2>

        <Row label="Sign out" caption="End your session on this device.">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </Row>

        <Row
          label="Delete account"
          caption="Permanently remove your account and all data."
        >
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="text-sm font-light text-destructive hover:underline underline-offset-4 transition-colors"
          >
            Delete
          </button>
        </Row>
      </section>

      <DeleteAccountDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        email={profile.email}
      />
    </div>
  );
}

function Row({
  label,
  caption,
  children,
}: {
  label: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-1">
      <div className="space-y-0.5 pt-1">
        <p className="text-base font-light">{label}</p>
        {caption && (
          <p className="text-xs font-light text-foreground/40">{caption}</p>
        )}
      </div>
      <div className="shrink-0 flex items-center">{children}</div>
    </div>
  );
}

interface SelectChipProps {
  value: string;
  onChange: (next: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

function SelectChip({
  value,
  onChange,
  options,
  placeholder,
  className,
}: SelectChipProps) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent pr-6 pl-0 py-1 text-base font-light text-foreground/80 border-b border-border/40 focus:border-foreground focus:outline-none cursor-pointer transition-colors"
      >
        {placeholder && !value && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/40 pointer-events-none" />
    </div>
  );
}
