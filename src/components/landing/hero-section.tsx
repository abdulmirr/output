'use client';

import { FadeIn } from './fade-in';
import { WaitlistForm } from '@/app/waitlist/waitlist-form';

export function HeroSection() {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08]">
              Your work,
              <br />
              measured.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Track your focus. See what you ship.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={150}>
          <div className="mt-8 max-w-md">
            <WaitlistForm />
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            Currently building, join the waitlist
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
