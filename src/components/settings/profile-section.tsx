'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/(auth)/actions';
import type { UserProfile } from '@/lib/types';

interface ProfileSectionProps {
  profile: UserProfile | null;
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  const initials = profile?.displayName
    ? profile.displayName.charAt(0).toUpperCase()
    : profile?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h3 className="text-sm font-medium">
          {profile?.displayName || 'User'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {profile?.email || 'user@example.com'}
        </p>
      </div>
      <form action={logout}>
        <Button variant="outline" size="sm" type="submit">
          Sign out
        </Button>
      </form>
    </div>
  );
}
