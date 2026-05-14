# TODO — Stage 1: Authentication & User System

## Planned edits
- [ ] Remove "Get Started" CTA from `src/components/Header.tsx` (desktop + mobile).
- [ ] Keep "Start for Free" in `src/pages/Home.tsx`, but change it to redirect to `/login`.
- [ ] Implement phone OTP real-time verification in `src/pages/Login.tsx` using Supabase phone auth.
- [ ] Ensure successful login redirects to `/dashboard` (not `/discover`).
- [ ] Make `src/pages/Settings.tsx` load authenticated user profile from Supabase and save edits to Supabase (name/bio/profile image/skills/experience).
- [ ] Place Sign Out button inside Settings/Profile section using `useAuth().signOut`.
- [ ] Remove static user name "Rahul Gupta" from `src/pages/Dashboard.tsx` and any other user-specific places.
- [ ] Remove static reviewer "Rahul Gupta" from `src/pages/Profile.tsx` where it represents user reviews.
- [ ] Reduce/disable demo/localStorage auth fallbacks in `src/context/AuthContext.tsx` so sessions are real.

## Followup validation
- [ ] Verify unauthenticated users are redirected to `/login` when hitting `/dashboard` and `/settings`.
- [ ] Validate Google login and Phone OTP login (enter OTP -> verify -> redirected).
- [ ] Validate Settings edits persist after refresh.

