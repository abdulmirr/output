'use client';

import { FadeIn } from './fade-in';

export function PlatformBanner() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Available everywhere, soon.
            </h2>
            <p className="mt-3 text-muted-foreground text-base max-w-md mx-auto">
              Start on the web today. Desktop and mobile are on the way.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={150}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {/* Web — Live */}
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">Web app</div>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="landing-pulse-dot" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">Live now</span>
                </div>
              </div>
            </div>

            {/* Desktop — Coming soon */}
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M2 14h20" />
                  <path d="m6 21 .5-3" />
                  <path d="m18 21-.5-3" />
                  <path d="M6 21h12" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">Desktop app</div>
                <div className="text-xs text-muted-foreground mt-1">Coming soon</div>
              </div>
            </div>

            {/* iOS — Coming soon */}
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <path d="M12 18h.01" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold">iOS app</div>
                <div className="text-xs text-muted-foreground mt-1">Coming soon</div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
