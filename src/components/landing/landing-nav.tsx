'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-lg border-b border-border'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/output-logo.svg" alt="Output" width={26} height={28} className="h-7 w-auto" />
          <span className="text-2xl font-semibold tracking-tight">Output</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-md hover:bg-foreground/90 transition-all shadow-sm"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}
