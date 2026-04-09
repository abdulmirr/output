import { LandingNav } from '@/components/landing/landing-nav';
import { Footer } from '@/components/landing/footer';
import { WaitlistForm } from './waitlist-form';
import { FadeIn } from '@/components/landing/fade-in';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Output - Join the Waitlist',
  description: 'The minimal tracker for people who build. Join the Output waitlist.',
};

export default function WaitlistPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />

      <main className="flex-1 pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <FadeIn>
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08]">
                Coming<br />
                soon.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Output is a minimal tracker for founders, creators, and students who build. Hit a shortcut, start tracking, and see what you actually ship.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="mt-10 max-w-sm">
              <WaitlistForm />
            </div>
          </FadeIn>
        </div>
      </main>

      <Footer />
    </div>
  );
}
