import Image from 'next/image';
import { Zap, CheckSquare, Calendar } from 'lucide-react';

export function AppMockup() {
  return (
    <div className="rounded-xl border border-border bg-background shadow-2xl shadow-black/10 dark:shadow-black/30 overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
          <div className="h-3 w-3 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 mx-8">
          <div className="h-6 rounded-md bg-muted border border-border flex items-center px-3">
            <span className="text-[11px] text-muted-foreground/60 font-mono">localhost:3000/output</span>
          </div>
        </div>
      </div>

      {/* App content */}
      <div className="flex h-[340px] md:h-[400px]">
        {/* Sidebar */}
        <div className="hidden sm:flex w-44 border-r border-sidebar-border bg-sidebar flex-col py-3">
          {/* User header */}
          <div className="px-2 mb-3">
            <div className="flex items-center gap-2 px-2 py-2 rounded-md">
              <div className="h-5 w-5 rounded-full bg-muted-foreground/30 shrink-0" />
              <span className="text-xs font-semibold text-sidebar-foreground truncate flex-1">Abdul Mir</span>
            </div>
          </div>

          {/* Pages label */}
          <p className="px-4 mb-1.5 text-[10px] font-semibold tracking-widest uppercase text-sidebar-foreground/30 select-none">
            Pages
          </p>

          {/* Nav items */}
          <div className="px-2 space-y-0.5">
            <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2 bg-sidebar-accent">
              <Zap className="h-3.5 w-3.5 text-sidebar-foreground/80 shrink-0" />
              <span className="text-xs font-semibold text-sidebar-accent-foreground">output</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2">
              <CheckSquare className="h-3.5 w-3.5 text-sidebar-foreground/40 shrink-0" />
              <span className="text-xs font-medium text-sidebar-foreground/50">tasks</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2">
              <Calendar className="h-3.5 w-3.5 text-sidebar-foreground/40 shrink-0" />
              <span className="text-xs font-medium text-sidebar-foreground/50">archive</span>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 px-6 py-5 overflow-hidden">
          {/* Date header */}
          <div className="text-sm font-semibold mb-5">Sunday, March 29</div>

          {/* Daily todos */}
          <div className="mb-5">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Today&apos;s focus
            </div>
            <div className="space-y-1.5">
              <MockTodo text="Finish landing page design" done />
              <MockTodo text="Review auth flow" done={false} />
              <MockTodo text="Write API tests" done={false} />
            </div>
          </div>

          {/* Output section */}
          <div className="text-[13px] font-semibold tracking-[-0.02em] mb-1">Output:</div>
          <div>
            <MockBlock time="9-10:45 AM" title="Landing page components" score="5/5" scoreColor="text-green-500" />
            <div className="h-px bg-border/50 ml-[136px]" />
            <MockBlock time="11:15-12:30 PM" title="Supabase auth integration" score="4/5" scoreColor="text-blue-400" />
            <div className="h-px bg-border/50 ml-[136px]" />
            <MockBlock time="2-3:20 PM" title="Calendar view polish" score="3/5" scoreColor="text-yellow-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MockTodo({ text, done }: { text: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-3.5 w-3.5 rounded-sm border ${
          done ? 'bg-primary border-primary' : 'border-border'
        } flex items-center justify-center shrink-0`}
      >
        {done && (
          <svg
            className="h-2.5 w-2.5 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-xs ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {text}
      </span>
    </div>
  );
}

function MockBlock({
  time,
  title,
  score,
  scoreColor,
}: {
  time: string;
  title: string;
  score: string;
  scoreColor: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-md">
      <div className="text-[11px] text-muted-foreground font-mono w-[104px] shrink-0">{time}</div>
      <div className={`text-[11px] font-mono w-7 shrink-0 ${scoreColor}`}>{score}</div>
      <span className="text-xs font-normal truncate">{title}</span>
    </div>
  );
}
