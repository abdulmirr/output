# Output - Full Stack Productivity Tracker

## Context
Building "Output" from scratch — a frictionless worklog/productivity web app for students, entrepreneurs, and self-directed workers. The core appeal is how fast it is to track focused work sessions via a global hotkey, and how satisfying it is to visualize your actual output over time. Clean, minimal design with Inter font. Built with Next.js 15 (App Router), Supabase, Tailwind CSS, deployed on Vercel.

---

## Tech Stack
- **Framework**: Next.js 15, App Router, TypeScript, Turbopack
- **UI**: Tailwind CSS + shadcn/ui components, Inter font via `next/font/google`
- **State**: Zustand (work block, overlay, timer, theme, tasks)
- **Hotkeys**: `react-hotkeys-hook` (registered at root layout level)
- **Overlays**: React Portals into a `<div id="portal-root" />`
- **Auth/DB**: Supabase (`@supabase/ssr`, cookie-based auth, RLS)
- **Validation**: Zod (Phase 5)
- **Testing**: Vitest + React Testing Library (Phase 5)
- **Deploy**: Vercel
- **Toasts**: `sonner` for success/error feedback
- **Optional**: `framer-motion` (overlay animations)
- **Future**: Tauri/Electron wrapper for system-wide hotkeys (code structured to support this)

---

## Folder Structure
```
src/
├── app/
│   ├── layout.tsx              # Root: Inter font, providers, portal root, GlobalHotkeys, overlays
│   ├── page.tsx                # Landing page (Phase 4) or redirect to /output
│   ├── globals.css             # Tailwind + CSS variables for light/dark theming
│   ├── (auth)/
│   │   ├── layout.tsx          # Centered card layout
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── auth/callback/route.ts
│   └── (app)/
│       ├── layout.tsx          # App shell: sidebar + main content
│       ├── output/page.tsx     # Daily log (main page)
│       ├── tasks/page.tsx      # Task manager with sub-tabs
│       ├── calendar/page.tsx   # Calendar/list view of past days
│       └── settings/page.tsx   # Profile + preferences
├── components/
│   ├── ui/                     # shadcn/ui auto-generated
│   ├── layout/                 # sidebar, theme-toggle, header (mobile)
│   ├── work-block/             # overlay, start form, active view, focus rating, timer, emoji slider
│   ├── output/                 # daily header, daily todos, output section, block cards, thoughts, log-off
│   ├── tasks/                  # task list, task item, creation dialog, tabs, empty states
│   ├── calendar/               # grid, day cards, hover popover, list view, day detail, view toggle
│   ├── settings/               # profile section, settings form
│   └── shared/                 # global-hotkeys, portal, theme-applier, loading skeletons
├── stores/
│   ├── work-block-store.ts     # Active block state machine + completed blocks
│   ├── overlay-store.ts        # Which overlay is visible
│   ├── theme-store.ts          # Light/dark/system (persisted to localStorage)
│   ├── task-store.ts           # Task CRUD (localStorage in Phase 2, Supabase in Phase 3)
│   ├── daily-log-store.ts      # Daily todos, thoughts, log-off state
│   └── store-provider.tsx      # Hydration-safe wrapper
├── hooks/
│   ├── use-timer.ts            # Stopwatch/countdown with 1s intervals
│   └── use-work-block.ts       # Work block lifecycle convenience hook
├── lib/
│   ├── types.ts                # WorkBlock, Task, DailyLog, DailyTodo, UserProfile
│   ├── constants.ts            # Hotkey bindings, emoji map, limits
│   ├── utils.ts                # cn(), formatDuration(), formatTimeRange(), parseDurationInput()
│   ├── mock-data.ts            # Realistic sample data for Phase 1
│   ├── api/                    # Data access layer (Supabase queries, Phase 3)
│   └── supabase/               # client.ts, server.ts, middleware.ts (Phase 3)
└── middleware.ts               # Auth route protection (Phase 3)
```

---

## Phase 1: Core Functionality (Visual Foundation)

**Goal**: Every page renders with mock data. All components built and styled. No interactivity yet.

### 1.1 — Project scaffolding
- `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack`
- `git init`
- `npx shadcn@latest init` (neutral base color, CSS variables)
- `npx shadcn@latest add button input dialog slider checkbox tabs card calendar tooltip textarea dropdown-menu avatar badge separator popover toggle`
- `npm install zustand react-hotkeys-hook sonner`
- Note: All hotkey logic isolated in `global-hotkeys.tsx` and store actions — when wrapping in Tauri/Electron later, we only swap the hotkey registration layer, not the app logic.

### 1.2 — Foundation files
- `src/lib/types.ts` — All TypeScript interfaces (WorkBlock, Task, DailyLog, DailyTodo, UserProfile)
- `src/lib/constants.ts` — Hotkey strings, emoji map (1-10), MAX_DAILY_TODOS
- `src/lib/utils.ts` — `cn()`, `formatDuration()`, `formatTimeRange()`, `formatDate()`, `parseDurationInput()`, `generateId()`, `getTodayString()`
- `src/lib/mock-data.ts` — Sample work blocks, tasks, daily logs, daily todos, plus 30 days of historical data for calendar
- `src/app/globals.css` — Tailwind directives + CSS custom properties for light/dark themes
- `src/app/layout.tsx` — Root layout with Inter font, `<div id="portal-root" />`

### 1.3 — Layout shell
- `src/components/layout/sidebar.tsx` — Fixed left sidebar (240px), nav items (Output, Tasks, Calendar), profile/settings at bottom, theme toggle
- `src/components/layout/theme-toggle.tsx` — Sun/moon icon button (visual only in Phase 1)
- `src/app/(app)/layout.tsx` — App shell composing sidebar + scrollable main area

### 1.4 — Output page
- `src/app/(app)/output/page.tsx` — Composes all sections below with mock data
- `src/components/output/daily-header.tsx` — Today's date ("Tuesday, March 25, 2026")
- `src/components/output/daily-todos.tsx` — 1-3 checkbox items
- `src/components/output/output-section.tsx` — List of completed block cards + plus icon
- `src/components/output/output-block-card.tsx` — Time range + title + focus badge
- `src/components/output/add-block-dialog.tsx` — Manual block entry (title, start time, end time)
- `src/components/output/thoughts-section.tsx` — Free-form textarea
- `src/components/output/log-off-flow.tsx` — Multi-step: focus rating → reflection + tomorrow's tasks

### 1.5 — Work block overlay
- `src/components/shared/portal.tsx` — React Portal wrapper
- `src/components/work-block/work-block-overlay.tsx` — Portal-rendered centered floating window, renders one of 3 sub-views
- `src/components/work-block/work-block-start.tsx` — "What are you working on?" + stopwatch/timer toggle + start button
- `src/components/work-block/work-block-active.tsx` — Task title, running timer, Complete/Discard buttons, "Esc to cancel"
- `src/components/work-block/timer-display.tsx` — HH:MM:SS display (monospaced)
- `src/components/work-block/timer-input.tsx` — Natural input parsing ("1h 20m")
- `src/components/work-block/focus-rating.tsx` — "How focused were you?" + optional thoughts textarea
- `src/components/work-block/emoji-slider.tsx` — Draggable 1-10 scale with reactive emoji face

### 1.6 — Tasks page
- `src/app/(app)/tasks/page.tsx` — Composes tabs + task list with mock data
- `src/components/tasks/task-tabs.tsx` — Inbox / This Week / Today tabs
- `src/components/tasks/task-list.tsx` — Renders task items or empty state
- `src/components/tasks/task-item.tsx` — Checkbox + title + due date badge + delete (hover)
- `src/components/tasks/task-creation-dialog.tsx` — Portal overlay: title, optional due date, optional notes, Save/Discard
- `src/components/tasks/task-empty-state.tsx` — Per-tab empty states with hotkey hints

### 1.7 — Calendar page
- `src/app/(app)/calendar/page.tsx` — Calendar grid or list view with mock historical data
- `src/components/calendar/calendar-grid.tsx` — Monthly grid, prev/next navigation
- `src/components/calendar/calendar-day-card.tsx` — Date, focus score dot, top 3 tasks (truncated)
- `src/components/calendar/calendar-day-hover.tsx` — Popover with full day output on hover
- `src/components/calendar/calendar-list-view.tsx` — Chronological list alternative
- `src/components/calendar/calendar-day-detail.tsx` — Full read-only day view (modal or inline)
- `src/components/calendar/view-toggle.tsx` — Grid/list toggle buttons
- `src/components/calendar/weekly-summary.tsx` — Tab/section showing total hours worked, avg focus score, completed tasks count for the selected week

### 1.8 — Settings page
- `src/app/(app)/settings/page.tsx` — Profile section + preferences form
- `src/components/settings/profile-section.tsx` — Avatar, name, email display
- `src/components/settings/settings-form.tsx` — Theme pref, keyboard shortcuts reference

### 1.9 — Shared components
- `src/components/shared/global-hotkeys.tsx` — Registers Cmd+Shift+O, Cmd+Shift+N, and Cmd+/ (console.log only in Phase 1)
- `src/components/shared/keyboard-shortcuts-dialog.tsx` — Overlay showing all available shortcuts (triggered by Cmd+/ or `?`), lists hotkeys with descriptions
- Toast provider (`<Toaster />` from sonner) added to root layout

---

## Phase 2: Interactive State & Routing

**Goal**: Every button, form, timer, and hotkey works. Fully functional with client-side state (Zustand + localStorage). No auth/DB.

### 2.1 — Zustand stores
- `work-block-store.ts` — State machine: idle → start → active → rating → completed. Persisted to localStorage. Tracks `activeBlock`, `blocks[]`, `phase`.
- `overlay-store.ts` — `activeOverlay` (work-block | task-creation | log-off | add-block | null), open/close/toggle actions
- `theme-store.ts` — Light/dark/system with localStorage persist
- `task-store.ts` — Task CRUD with localStorage persist, filtered getters by category
- `daily-log-store.ts` — Daily todos, thoughts, log-off state, keyed by date

### 2.2 — Timer hook
- `src/hooks/use-timer.ts` — Supports stopwatch (count up) and countdown modes. Returns `{ seconds, isRunning, start, pause, reset, formattedTime }`. Countdown fires `onComplete` callback at zero.

### 2.3 — Wire everything up
- Root layout: wrap in `StoreProvider`, add `GlobalHotkeys`, `WorkBlockOverlay`, `TaskCreationDialog`
- `GlobalHotkeys`: Cmd+Shift+O toggles work block overlay (respects current phase), Cmd+Shift+N toggles task creation, Esc closes overlays
- Work block overlay: state machine drives which sub-view renders. Timer runs even when overlay is hidden.
- Output page: reads from stores, auto-saves thoughts (debounced), log-off flow creates tomorrow's todos
- Tasks page: reads/writes from task store, creation dialog connected
- Calendar page: aggregates historical data from work-block and daily-log stores
- Dark mode: `theme-applier.tsx` toggles `.dark` class on `<html>`, respects system preference
- Toast notifications: wire `sonner` toasts on block complete, task create/delete, log-off, errors
- Keyboard shortcuts dialog: Cmd+/ opens overlay listing all hotkeys

### Work Block State Machine
```
[Idle] → Cmd+Shift+O → [Start Form]
[Start Form] → Enter/Start → [Active, timer running]
[Active] → Esc → [Active, overlay hidden, timer still running]
[Active, hidden] → Cmd+Shift+O → [Active, overlay visible]
[Active] → Complete → [Focus Rating]
[Active] → Discard → [Idle]
[Focus Rating] → Submit → [Idle, block saved to store]
```

---

## Phase 3: Auth + Database (Supabase)

**Goal**: Replace localStorage with Supabase. Add auth. Protect routes.

### 3.1 — Supabase setup
- `npm install @supabase/supabase-js @supabase/ssr`
- `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `src/lib/supabase/client.ts` — Browser client via `createBrowserClient()`
- `src/lib/supabase/server.ts` — Server client via `createServerClient()` with cookie handling
- `src/lib/supabase/middleware.ts` — Token refresh helper using `getUser()` (never `getSession()`)
- `src/middleware.ts` — Route protection: redirect unauthed users to /login, redirect authed users away from auth pages

### 3.2 — Database schema
| Table | Key Columns |
|-------|-------------|
| `profiles` | id (FK auth.users), email, display_name, avatar_url, theme |
| `work_blocks` | id, user_id, title, start_time, end_time, duration, type, planned_duration, focus_score, thoughts, status |
| `tasks` | id, user_id, title, notes, due_date, status, category, sort_order |
| `daily_logs` | id, user_id, date (unique per user), daily_thoughts, daily_focus_score, daily_reflection, logged_off |
| `daily_todos` | id, user_id, daily_log_id, task_text, completed, sort_order, date |

- All tables have RLS enabled with policies: users can only CRUD their own rows
- Auto-create profile on signup via trigger
- Indexes on (user_id, date) for fast daily queries

### 3.3 — Auth pages
- Login (email/password), Signup, Forgot Password, OAuth callback handler
- Centered card layout via `(auth)/layout.tsx`

### 3.4 — Data layer migration
- Hybrid approach: Zustand keeps UI-only state (active block, overlays, timer, theme). Persistent data (completed blocks, tasks, logs) fetched via Server Components + mutated via Server Actions.
- Server Actions in `src/app/(app)/output/actions.ts`, `tasks/actions.ts` etc. with `revalidatePath()` after mutations
- Active work block backed up to localStorage for page-refresh recovery

---

## Phase 4: Landing Page

**Goal**: Public marketing page at `/` that converts visitors.

- `src/app/page.tsx` — Hero, features, how-it-works, CTA, footer
- `src/components/landing/` — landing-nav, hero-section, features-section, how-it-works-section, cta-section, footer
- OG metadata for social sharing

---

## Phase 5: End-to-End Sweep

**Goal**: Production-ready. Secure, tested, performant, deployed.

- **Security**: Zod validation on all Server Actions, verify RLS policies, security headers in `next.config.ts`, no `getSession()` in server code
- **Error handling**: Error boundaries (`error.tsx`), loading states (`loading.tsx`), 404 page
- **Testing**: Vitest + RTL — focus on work block state machine, timer hook, duration parsing, task filtering
- **Performance**: `next/font` for Inter, `React.memo` on calendar day cards, debounced auto-save, lazy-load calendar grid
- **Accessibility**: Focus management on overlay open/close, `aria-labels`, keyboard nav, color contrast (both themes)
- **Deploy**: Push to GitHub → connect to Vercel → set env vars → deploy → verify full auth flow + data sync + hotkeys

---

## Edge Cases to Handle
- **Midnight rollover**: Block that spans midnight belongs to the day it started (use `start_time`)
- **Timer reaches zero**: Show notification, transition to completion flow (don't auto-discard)
- **Forgotten blocks**: Cap at 12h, show warning. Add auto-remind in settings.
- **Page refresh during active block**: localStorage backup, restore on mount
- **Daily todo carryover**: Log-off creates tomorrow's daily todos
- **Time zones**: Store as UTC, display in local time via `Intl.DateTimeFormat`

---

## Verification Plan
After each phase, verify:
1. **Phase 1**: All pages render at `/output`, `/tasks`, `/calendar`, `/settings`. Sidebar navigation works. Mock data displays correctly. Responsive layout.
2. **Phase 2**: Cmd+Shift+O starts/shows work block. Timer counts correctly. Blocks save to output section. Tasks CRUD works across tabs. Dark mode toggles. Log-off flow saves tomorrow's todos. Data persists across refresh.
3. **Phase 3**: Signup → login → see empty output page → create block → see it saved → refresh → still there. RLS: user A cannot see user B's data. Middleware redirects properly.
4. **Phase 4**: Landing page renders at `/`. CTA links to signup. OG image works.
5. **Phase 5**: Run test suite. Lighthouse audit >90. Try XSS in text inputs. Try accessing `/output` while logged out. Deploy and repeat checks on production URL.
