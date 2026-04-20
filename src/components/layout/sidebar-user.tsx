import { getProfile } from '@/lib/api/queries';

export async function SidebarUser() {
  const profile = await getProfile();
  const name = profile?.preferredName || profile?.displayName || profile?.email?.split('@')[0] || 'User';
  const avatar = profile?.avatarUrl || undefined;

  return (
    <>
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar}
          alt={name}
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="h-8 w-8 shrink-0 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-light text-foreground/60">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-base font-normal text-foreground truncate">{name}</span>
    </>
  );
}

export function SidebarUserSkeleton() {
  return (
    <>
      <div className="h-8 w-8 shrink-0 rounded-full bg-foreground/10" />
      <span className="h-4 w-20 rounded bg-foreground/10" />
    </>
  );
}
