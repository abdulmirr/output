'use client';

import { FadeIn } from './fade-in';

export function PlatformBanner() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Desktop & Mobile coming soon...
            </h2>
            <p className="mt-2 text-muted-foreground text-sm max-w-md mx-auto">
              Start on the web today. Native apps are on the roadmap.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={150} className="max-w-[480px] mx-auto">
          <div className="rounded-xl border border-border bg-card/50 shadow-sm overflow-hidden divide-y divide-border">
            {/* Web — Live */}
            <div className="flex items-center justify-between p-4 md:px-5 hover:bg-foreground/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-background border border-border flex items-center justify-center shrink-0">
                  <svg className="h-4 w-4 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8" />
                    <path d="M12 17v4" />
                  </svg>
                </div>
                <span className="font-medium text-sm">Web application</span>
              </div>
              <div className="flex items-center gap-2 border border-green-500/20 bg-green-500/10 px-2 py-1 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-green-600 dark:text-green-500">Live now</span>
              </div>
            </div>

            {/* Desktop — Coming soon */}
            <div className="flex items-center justify-between p-4 md:px-5 hover:bg-foreground/[0.02] transition-colors opacity-80">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-background/50 border border-border flex items-center justify-center shrink-0">
                  <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M2 14h20" />
                    <path d="m6 21 .5-3" />
                    <path d="m18 21-.5-3" />
                    <path d="M6 21h12" />
                  </svg>
                </div>
                <span className="font-medium text-sm text-muted-foreground">macOS & Windows</span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">In development</span>
            </div>

            {/* iOS — Coming soon */}
            <div className="flex items-center justify-between p-4 md:px-5 hover:bg-foreground/[0.02] transition-colors opacity-80">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-background/50 border border-border flex items-center justify-center shrink-0">
                  <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <path d="M12 18h.01" />
                  </svg>
                </div>
                <span className="font-medium text-sm text-muted-foreground">iOS app</span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">Coming later</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
