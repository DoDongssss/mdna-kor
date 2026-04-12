# 🏍️ MC Club System — Feature Development Plan

> A phased, feature-by-feature build plan.
> Each phase is independently deployable and testable before moving on.

---

## Overview

| Phase | Focus | Est. Effort |
|---|---|---|
| Phase 1 | Project setup & Supabase foundation | 1–2 days |
| Phase 2 | Admin authentication & routing | 1 day |
| Phase 3 | Member management | 1–2 days |
| Phase 4 | Eyeball (meetup) management | 1–2 days |
| Phase 5 | Attendance tracking | 1 day |
| Phase 6 | Contributions tracking | 1–2 days |
| Phase 7 | Expense tracking | 1 day |
| Phase 8 | Fund dashboard & analytics | 1–2 days |
| Phase 9 | Events management | 1 day |
| Phase 10 | Public landing & transparency page | 2 days |
| Phase 11 | Polish, RLS hardening & deployment | 1–2 days |

---

## Phase 1 — Project Setup & Supabase Foundation

**Goal:** A running React app connected to a live Supabase project with the full schema in place.

### Tasks

- [ ] Scaffold project with Vite + React + TypeScript
- [ ] Install and configure Tailwind CSS
- [ ] Install and init shadcn/ui
- [ ] Install dependencies: `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers`, `recharts`, `react-router-dom`, `@supabase/supabase-js`
- [ ] Create Supabase project, copy URL + anon key to `.env.local`
- [ ] Write `src/supabase/client.ts` singleton
- [ ] Write and run migration `001_init_schema.sql`:
  - Tables: `users`, `members`, `eyeballs`, `attendance`, `contributions`, `expenses`, `events`, `media`
  - Nullable FKs: `eyeball_id` on `contributions` and `expenses`
  - Soft delete: `deleted_at` on `members`
  - Unique constraint: `(member_id, eyeball_id)` on `contributions` — or document the multi-contribution decision
- [ ] Write migration `002_rls_policies.sql` (public read, admin write)
- [ ] Run `supabase gen types` → `src/supabase/types/database.types.ts`
- [ ] Set up folder structure per `FOLDER_STRUCTURE.md`
- [ ] Create `src/router.tsx` with placeholder routes
- [ ] Create `src/App.tsx` with providers shell

### Deliverable
App runs at `localhost:5173`, Supabase connection verified, schema confirmed in Supabase dashboard.

---

## Phase 2 — Admin Authentication & Route Protection

**Goal:** Admin can log in, session persists on refresh, all `/admin/*` routes are gated.

### Tasks

- [ ] Create `src/stores/auth.store.ts` — session, user, isAdmin, login(), logout()
- [ ] Create `src/hooks/useAuth.ts` — listens to `onAuthStateChange`, syncs to store
- [ ] Build `src/features/auth/LoginPage.tsx`:
  - Email + password form (RHF + Zod)
  - Error handling for wrong credentials
  - Redirect to `/admin` on success
- [ ] Build `src/features/auth/ProtectedRoute.tsx`:
  - Reads `isAdmin` from auth store
  - Redirects to `/login` if not authenticated
  - Shows loading state while session is being checked
- [ ] Wire `ProtectedRoute` around all `/admin/*` routes in `router.tsx`
- [ ] Build `src/components/layout/AdminLayout.tsx`:
  - Sidebar with nav links (Dashboard, Members, Eyeballs, Attendance, Contributions, Expenses, Events)
  - Topbar with club name + logout button
- [ ] Build `src/components/layout/PublicLayout.tsx`:
  - Simple header + footer

### Deliverable
Admin logs in, session survives refresh, visiting `/admin` without login redirects to `/login`. All admin pages render inside `AdminLayout`.

---

## Phase 3 — Member Management

**Goal:** Admin can create, view, edit, soft-delete, and toggle active status of members.

### Tasks

- [ ] Write domain types: `src/types/members.ts`
- [ ] Write Zod schema: `src/schemas/member.schema.ts`
- [ ] Write lib functions: `src/lib/members.ts`
  - `getMembers()` — excludes soft-deleted
  - `getMembersIncludeInactive()` — all non-deleted
  - `createMember(data)`
  - `updateMember(id, data)`
  - `toggleActive(id, currentStatus)`
  - `softDeleteMember(id)` — sets `deleted_at`
- [ ] Build `src/hooks/useMembers.ts`
- [ ] Build `src/features/members/MemberForm.tsx`:
  - Fields: name, nickname, contact number, is_active toggle
  - Used for both create and edit (controlled by prop)
- [ ] Build `src/features/members/MemberTable.tsx`:
  - Columns: name, nickname, contact, status badge, actions (edit, toggle, delete)
  - Filter: active / inactive / all
  - Search by name
- [ ] Build `src/features/members/MembersPage.tsx`:
  - PageHeader with "Add Member" button
  - MemberTable + MemberForm in a Sheet/Dialog
- [ ] Add `src/components/common/ConfirmDialog.tsx` for delete confirmation

### Deliverable
Admin can fully manage the member roster. Deleted members are hidden but data is preserved. Active/inactive filter works.

---

## Phase 4 — Eyeball (Meetup) Management

**Goal:** Admin can create, view, and manage club meetups. Each meetup has a detail view.

### Tasks

- [ ] Write domain types: `src/types/eyeballs.ts`
- [ ] Write Zod schema: `src/schemas/eyeball.schema.ts`
- [ ] Write lib functions: `src/lib/eyeballs.ts`
  - `getEyeballs()` — ordered by date desc
  - `getEyeballById(id)` — with joined attendance + contribution counts
  - `createEyeball(data)`
  - `updateEyeball(id, data)`
  - `deleteEyeball(id)`
- [ ] Build `src/hooks/useEyeballs.ts`
- [ ] Build `src/features/eyeballs/EyeballForm.tsx`:
  - Fields: title (optional), date, location, notes
- [ ] Build `src/features/eyeballs/EyeballCard.tsx`:
  - Shows: date, location, attendance count, total collected
  - Links to detail page
- [ ] Build `src/features/eyeballs/EyeballsPage.tsx`:
  - Grid of EyeballCards + "New Eyeball" button
- [ ] Build `src/features/eyeballs/EyeballDetail.tsx`:
  - Header: meetup info
  - Tabs or sections: Attendance | Contributions
  - Renders `AttendanceToggle` and `ContributionList` in context

### Deliverable
Admin can create meetups and navigate to each one's detail page. Attendance and contribution sections are placeholder-ready for the next phases.

---

## Phase 5 — Attendance Tracking

**Goal:** Admin can mark each member as present or absent for a given eyeball.

### Tasks

- [ ] Write domain types: `src/types/attendance.ts`
- [ ] Write lib functions: `src/lib/attendance.ts`
  - `getAttendanceByEyeball(eyeballId)` — returns member + status list
  - `upsertAttendance(eyeballId, memberId, status)` — insert or update
  - `bulkUpsertAttendance(eyeballId, records[])` — for batch save
- [ ] Build `src/hooks/useAttendance.ts`
- [ ] Build `src/features/attendance/AttendanceToggle.tsx`:
  - Per-member row with present/absent toggle (optimistic update)
  - Shows member name + nickname
- [ ] Build `src/features/attendance/AttendancePage.tsx`:
  - Eyeball selector dropdown
  - Renders list of all active members with `AttendanceToggle`
  - Summary: X present / Y absent
- [ ] Integrate attendance list into `EyeballDetail.tsx`

### Deliverable
Admin selects a meetup, marks each member present or absent. Status saves to DB immediately on toggle. Attendance count shows on EyeballCard.

---

## Phase 6 — Contribution Tracking

**Goal:** Admin can record fund contributions per member, optionally linked to an eyeball.

### Tasks

- [ ] Write domain types: `src/types/contributions.ts`
- [ ] Write Zod schema: `src/schemas/contribution.schema.ts`
- [ ] Write lib functions: `src/lib/contributions.ts`
  - `getContributions()` — all, ordered by date desc
  - `getContributionsByEyeball(eyeballId)`
  - `getContributionsByMember(memberId)`
  - `addContribution(data)` — with nullable `eyeball_id`
  - `deleteContribution(id)`
- [ ] Build `src/hooks/useContributions.ts` (or compose into `useFund.ts`)
- [ ] Build `src/features/contributions/ContributionForm.tsx`:
  - Fields: member (select), eyeball (select, optional), amount, notes, payment method
- [ ] Build `src/features/contributions/ContributionList.tsx`:
  - Table: member name, eyeball, amount, date, notes
  - Delete with confirm dialog
- [ ] Build `src/features/contributions/ContributionsPage.tsx`:
  - PageHeader + ContributionList + ContributionForm in Sheet
  - Filter by eyeball or member
- [ ] Integrate `ContributionList` into `EyeballDetail.tsx`
- [ ] Build `src/stores/fund.store.ts` — start tracking total contributions

### Deliverable
Admin can record any contribution. Contributions show on the eyeball detail page and the global contributions list. Fund store starts accumulating totals.

---

## Phase 7 — Expense Tracking

**Goal:** Admin can record and manage club expenses, optionally linked to an eyeball.

### Tasks

- [ ] Write domain types: `src/types/expenses.ts`
- [ ] Write Zod schema: `src/schemas/expense.schema.ts`
- [ ] Write lib functions: `src/lib/expenses.ts`
  - `getExpenses()` — ordered by date desc
  - `addExpense(data)` — with nullable `eyeball_id`
  - `updateExpense(id, data)`
  - `deleteExpense(id)`
- [ ] Build `src/features/expenses/ExpenseForm.tsx`:
  - Fields: title, amount, description, date, eyeball (optional)
- [ ] Build `src/features/expenses/ExpenseList.tsx`:
  - Table: title, amount, date, eyeball, description
  - Edit + delete actions
- [ ] Build `src/features/expenses/ExpensesPage.tsx`
- [ ] Update `src/stores/fund.store.ts` — add total expenses, net balance calc
- [ ] Build `src/utils/calcFundBalance.ts`

### Deliverable
Admin can record expenses. Fund store now has: total in (contributions), total out (expenses), net balance. Balance is correct and live.

---

## Phase 8 — Fund Dashboard & Analytics

**Goal:** Admin sees a real-time overview of club finances and activity on the dashboard.

### Tasks

- [ ] Build `src/components/common/StatCard.tsx`:
  - Props: label, value, sublabel, color variant
- [ ] Build `src/features/dashboard/FundSummaryChart.tsx`:
  - Recharts `AreaChart` — contributions vs expenses over time (monthly)
  - Recharts `PieChart` — expense breakdown by category/title
- [ ] Build `src/features/dashboard/RecentActivityList.tsx`:
  - Combined list of recent contributions + expenses (last 10)
  - Color-coded: green for in, red for out
- [ ] Build `src/features/dashboard/DashboardPage.tsx`:
  - Row of StatCards: Total Fund, Total Contributions, Total Expenses, Active Members
  - FundSummaryChart
  - RecentActivityList
  - Upcoming eyeball card

### Deliverable
Admin dashboard shows a live financial snapshot. Charts update as data changes. No manual refresh needed (Zustand + re-fetch on mount).

---

## Phase 9 — Events Management

**Goal:** Admin can create and manage public announcements/events. Public can view them.

### Tasks

- [ ] Write domain types: `src/types/events.ts`
- [ ] Write Zod schema: `src/schemas/event.schema.ts`
- [ ] Write lib functions: `src/lib/events.ts`
  - `getEvents()` — ordered by date asc (upcoming first)
  - `getPastEvents()` — date < today
  - `createEvent(data)`
  - `updateEvent(id, data)`
  - `deleteEvent(id)`
- [ ] Build `src/features/events/EventForm.tsx`:
  - Fields: title, type (meetup | charity_ride | announcement), date, description, location
- [ ] Build `src/features/events/EventsPage.tsx`:
  - Admin list with edit/delete, "New Event" button
- [ ] Build `src/pages/EventsPublicPage.tsx`:
  - Public read-only card list of upcoming events
  - Uses `PublicLayout`

### Deliverable
Admin manages events. Public `/events` page shows upcoming events without login.

---

## Phase 10 — Public Landing Page & Transparency Page

**Goal:** A public-facing club identity page and a full financial transparency view.

### Tasks

#### Landing Page
- [ ] Build `src/components/layout/Navbar.tsx`:
  - Logo, links: Home | Events | Transparency | Admin Login
- [ ] Build `src/pages/LandingPage.tsx` sections:
  - Hero: club name, tagline, CTA buttons
  - About: club description, founding year, mission
  - Upcoming Events: preview of next 3 events (from `lib/events`)
  - Fund Snapshot: total balance teaser (links to transparency page)
  - Gallery placeholder (wired to `media` table if populated)
  - Footer: contact, social links

#### Transparency Page
- [ ] Build `src/pages/TransparencyPage.tsx`:
  - Fund balance hero (total in - total out)
  - Contributions table: member (first name only for privacy?), eyeball, amount, date — paginated
  - Expenses table: title, amount, date, description — paginated
  - Recharts `AreaChart` — fund balance over time
  - Recharts `PieChart` — expense breakdown
  - Date range filter (last 3 months / 6 months / all time)

### Deliverable
Anyone can visit the public site without login. The transparency page shows a complete, honest financial record of the club.

---

## Phase 11 — Polish, RLS Hardening & Deployment

**Goal:** Production-ready. Secure, fast, and deployed.

### Tasks

#### Security
- [ ] Review all RLS policies in Supabase:
  - Public tables (`events`, `contributions`, `expenses`, `members`): SELECT allowed anon
  - All INSERT/UPDATE/DELETE: require `auth.role() = 'authenticated'` + admin check
- [ ] Confirm no sensitive fields (contact numbers) exposed to public queries
- [ ] Test unauthenticated access to all public routes — confirm no admin data leaks

#### UX Polish
- [ ] Add loading skeletons to all list pages
- [ ] Add toast notifications for all mutations (success + error) using shadcn `Toast`
- [ ] Add `EmptyState` components to all empty list views
- [ ] Mobile responsiveness pass: AdminLayout sidebar → drawer on small screens
- [ ] Add `formatCurrency` (Philippine Peso `₱`) and `formatDate` (local format) everywhere

#### Performance
- [ ] Add pagination to contributions and expenses lists (server-side, Supabase `.range()`)
- [ ] Add date range filter to transparency page queries
- [ ] Memoize expensive chart data transforms with `useMemo`

#### Deployment
- [ ] Push to GitHub
- [ ] Deploy to Vercel (connect repo, add env vars)
- [ ] Set Supabase allowed URLs to Vercel domain
- [ ] Smoke test all flows on production URL
- [ ] Create initial admin user in Supabase Auth dashboard

### Deliverable
System is live, secure, and ready for the club to use. Admin credentials handed off.

---

## Development Notes

### Recommended Build Order Within Each Phase

For each feature, follow this order:
1. Types (`src/types/`)
2. Zod schema (`src/schemas/`)
3. Lib functions (`src/lib/`) — test in Supabase dashboard first
4. Hook (`src/hooks/`)
5. Form component
6. List/Table component
7. Page component
8. Wire into router

### Testing Checkpoints

After each phase, verify:
- Data saves correctly in Supabase dashboard
- Data loads and displays in the UI
- Form validation errors show correctly
- Delete/edit flows work end to end
- No console errors

### Branch Strategy (Suggested)

```
main          ← production-ready only
dev           ← integration branch
feature/phase-1-setup
feature/phase-2-auth
feature/phase-3-members
... etc
```