'use client';

import Link from 'next/link';
import Image from 'next/image';
export function Footer() {
  return (
    <footer className="py-8">
      <div className="mx-auto max-w-5xl px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/output-logo.svg" alt="Output" width={16} height={24} className="h-5 w-auto" />
          <span className="text-sm font-medium">Output</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/privacypolicy"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/termsofservice"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms
          </Link>
          <span className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
