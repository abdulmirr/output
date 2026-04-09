'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FadeIn } from './fade-in';

export function CTASection() {
  return (
    <section className="py-24 md:py-32 bg-muted/40">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to see your output?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Free to use. No credit card required.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className={cn(buttonVariants({ size: 'lg' }))}
            >
              Get started
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
