'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { formatTimerDisplay } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function V2Animation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Total scrollable area is container height minus viewport
      const totalDistance = rect.height - windowHeight; 
      
      let dragged = 0;
      // Start tracking progress early to make the transition smooth
      if (rect.top <= windowHeight * 0.75) {
         dragged = (windowHeight * 0.75) - rect.top;
      }
      
      // Map to 0-1 range, finishing purely at the end of the container
      let p = dragged / (totalDistance * 0.9); 
      p = Math.max(0, Math.min(1, p));
      
      setProgress(p);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use the exact data from user's screenshot
  const blocks = [
    { title: 'Deep work — product build', duration: '1h 45m', drSec: 105 * 60, timeRange: '9:00 AM - 10:45 AM', rating: 'deep', score: '5/5', isDeep: true, color: 'text-green-500' },
    { title: 'Code review + PR feedback', duration: '45m', drSec: 45 * 60, timeRange: '11:00 AM - 11:45 AM', rating: 'ok', score: '3/5', isDeep: false, color: 'text-yellow-500' },
    { title: 'Research competitor pricing', duration: '30m', drSec: 30 * 60, timeRange: '12:30 PM - 1:00 PM', rating: 'distracted', score: '2/5', isDeep: false, color: 'text-orange-500' },
    { title: 'Landing page redesign', duration: '1h 10m', drSec: 70 * 60, timeRange: '1:15 PM - 2:25 PM', rating: 'deep', score: '5/5', isDeep: true, color: 'text-green-500' },
  ];

  // Distribute the 4 blocks smoothly across the 0-1 scale
  const visibleCount = progress > 0.8 ? 4 : progress > 0.5 ? 3 : progress > 0.3 ? 2 : progress > 0.1 ? 1 : 0;
  
  // Transform format precisely half-way through the scroll (progress ~0.65)
  const showDurationOutput = progress > 0.65;

  const totalSec = blocks.slice(0, visibleCount).reduce((acc, b) => acc + b.drSec, 0);
  const deepSec = blocks.slice(0, visibleCount).filter(b => b.isDeep).reduce((acc, b) => acc + b.drSec, 0);

  function formatCompactTime(sec: number) {
    if (sec === 0) return '0m';
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  }

  return (
    // Tall container controls the scroll length
    <div ref={containerRef} className="relative w-full h-[300vh] -mt-16 z-10 mx-auto">
      {/* Sticky tracker container */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center p-6 md:p-12 xl:p-16 w-full max-w-[1920px] mx-auto overflow-hidden">
        
        {/* Seamless ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[140px] rounded-full pointer-events-none transition-opacity duration-1000" style={{ opacity: progress > 0.1 ? 1 : 0 }} />

        {/* 1920x1080 (16:9 ratio) Premium Window Frame */}
        <div className="relative w-full max-w-6xl aspect-video rounded-3xl border border-border/60 bg-background/95 backdrop-blur-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-[1200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
             style={{
               transform: `scale(${0.96 + progress * 0.04}) translateY(${ (1 - progress) * 20 }px)`,
               opacity: 0.3 + progress * 0.7,
             }}
        >
          {/* Authentic Window Chrome */}
          <div className="absolute top-0 left-0 right-0 h-12 border-b border-border/40 bg-muted/30 flex items-center px-6 gap-2">
            <div className="flex items-center gap-2 opacity-60">
              <div className="w-3 h-3 rounded-full bg-border shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-border shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-border shadow-sm" />
            </div>
            <div className="flex-1 text-center pr-[60px]">
              <span className="text-[13px] font-medium text-muted-foreground/60 tracking-wide">
                Output — Wednesday, Apr 16
              </span>
            </div>
          </div>

          {/* Canvas Content Area - Perfectly centered like a pristine document */}
          <div className="absolute inset-0 top-12 p-10 md:p-16 lg:p-24 flex flex-col items-center">
            
            {/* The Document / Grid Limit Box - matches Obsidian's max-w line limits */}
            <div className="w-full max-w-4xl pt-8">
              
              {/* Output Header */}
              <div className="flex items-end justify-between mb-16 w-full border-b border-border/30 pb-6 transition-all duration-700">
                <div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">April 16</h2>
                  <p className="text-base md:text-lg lg:text-xl text-muted-foreground mt-2 font-light">Wednesday</p>
                </div>
                
                {/* Stats */}
                <div className={cn("text-right lg:text-lg font-medium tracking-wide transition-all duration-1000", 
                   visibleCount > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}>
                  <div className="flex justify-end gap-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-foreground tracking-tight tabular-nums w-[65px] text-right inline-block mr-1">{formatCompactTime(deepSec)}</span> 
                      <span className="text-muted-foreground/70 font-light">deep</span>
                    </div>
                    <div className="mx-2 text-muted-foreground/30">·</div>
                    <div className="flex items-center">
                      <span className="text-foreground tracking-tight tabular-nums w-[65px] text-right inline-block mr-1">{formatCompactTime(totalSec)}</span> 
                      <span className="text-muted-foreground/70 font-light">total</span>
                    </div>
                  </div>
                </div>
              </div>

               {/* Blocks List */}
               <div className="space-y-2">
                  {blocks.map((block, i) => {
                    const isVisible = visibleCount > i;
                    
                    return (
                      <div 
                        key={i} 
                        className={cn("flex items-center gap-6 md:gap-8 py-3.5 px-4 -mx-4 rounded-xl transition-all hover:bg-foreground/[0.02]", 
                          "duration-[900ms] ease-[cubic-bezier(0.1,0.9,0.2,1)] origin-top-left",
                          isVisible ? "opacity-100 translate-y-0 translate-x-0 blur-none" : "opacity-0 translate-y-12 -translate-x-8 blur-sm pointer-events-none absolute"
                        )}
                      >
                        {/* Time/Duration Toggle */}
                        <div className="w-[180px] lg:w-[200px] shrink-0">
                          <span className={cn("text-base lg:text-lg font-mono tracking-tight transition-all duration-700 ease-in-out", 
                            showDurationOutput ? "text-muted-foreground/60" : "text-muted-foreground/40"
                          )}>
                            {showDurationOutput ? block.duration : block.timeRange}
                          </span>
                        </div>

                        {/* Rating/Score Toggle */}
                        <div className="w-28 lg:w-32 shrink-0">
                          <span className={cn("text-base lg:text-lg font-mono font-medium tracking-wide transition-all duration-700 ease-in-out", 
                             block.color,
                             showDurationOutput ? "opacity-100" : "opacity-60"
                          )}>
                            {showDurationOutput ? block.rating : block.score}
                          </span>
                        </div>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <p className="text-lg lg:text-xl font-light text-foreground whitespace-pre-wrap leading-relaxed">
                            {block.title}
                          </p>
                        </div>
                      </div>
                    );
                  })}
               </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
