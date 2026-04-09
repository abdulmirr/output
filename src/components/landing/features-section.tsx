import { Zap, Target, CalendarDays } from 'lucide-react';
import { FadeIn } from './fade-in';

const features = [
  {
    icon: Zap,
    title: 'Start in seconds',
    description:
      'Open the work block overlay with a keyboard shortcut. Name your task, pick stopwatch or timer, and go.',
  },
  {
    icon: Target,
    title: 'Score your focus',
    description:
      'After each session, rate your focus 1\u20135 and jot down thoughts as you work. Build self-awareness over time.',
  },
  {
    icon: CalendarDays,
    title: 'See the pattern',
    description:
      'Your calendar fills with daily summaries. Spot trends, track streaks, and know exactly where your time goes.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 100}>
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-muted">
                  <feature.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
