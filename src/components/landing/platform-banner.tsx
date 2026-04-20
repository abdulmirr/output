'use client';

import { FadeIn } from './fade-in';
import { 
  Brain, 
  User, 
  Palette, 
  GraduationCap, 
  Rocket, 
  PenTool, 
  Hammer, 
  Terminal, 
  TrendingUp, 
  BookOpen 
} from 'lucide-react';

const ROLES = [
  { name: 'Deep Workers', icon: Brain },
  { name: 'Solopreneurs', icon: User },
  { name: 'Creators', icon: Palette },
  { name: 'Students', icon: GraduationCap },
  { name: 'Founders', icon: Rocket },
  { name: 'Designers', icon: PenTool },
  { name: 'Builders', icon: Hammer },
  { name: 'Nerds', icon: Terminal },
  { name: 'Productivity Bros', icon: TrendingUp },
  { name: 'Writers', icon: BookOpen },
];

export function PlatformBanner() {
  return (
    <section className="py-2 md:py-4 overflow-hidden">
      <FadeIn className="w-full text-center z-10">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">BUILT FOR</p>
        
        <div className="relative mt-8 mx-auto flex w-full max-w-[600px] flex-col items-center justify-center overflow-hidden">
          {/* Fading edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
          
          <div className="flex w-max pt-2 pb-6 animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex flex-shrink-0 gap-8 md:gap-16 pr-8 md:pr-16">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  return (
                    <span key={role.name} className="font-medium text-lg text-foreground tracking-tight flex items-center gap-2 opacity-60 grayscale whitespace-nowrap transition-all duration-300 hover:opacity-100 hover:grayscale-0">
                      <Icon className="w-5 h-5" />
                      {role.name}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
